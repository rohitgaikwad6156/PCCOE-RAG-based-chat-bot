import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';
import { logger } from '../utils/logger';

export interface AuthTokens {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    department: string;
    avatar?: string;
    profilePicture?: string;
    authProvider: 'local' | 'google';
    lastLoginAt?: Date;
  };
}

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    if (!env.GOOGLE_CLIENT_ID) {
      logger.warn('GOOGLE_CLIENT_ID is not set. Google OAuth sign-in will be unavailable.');
    }
  }

  generateToken(user: any): string {
    const userId = user._id ? user._id.toString() : user.id;
    return jwt.sign(
      { userId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  formatUser(user: any) {
    const id = user._id ? user._id.toString() : user.id;
    const picture = user.profilePicture || user.avatar || '';
    return {
      id,
      name: user.name,
      email: user.email,
      role: user.role as 'student' | 'admin',
      department: user.department || 'General',
      avatar: picture,
      profilePicture: picture,
      authProvider: (user.authProvider || 'local') as 'local' | 'google',
      lastLoginAt: user.lastLoginAt,
    };
  }

  private isAuthorizedAdmin(email: string): boolean {
    const clean = email.toLowerCase().trim();
    if (env.ADMIN_EMAIL && clean === env.ADMIN_EMAIL.toLowerCase().trim()) return true;
    return env.ADMIN_EMAILS.includes(clean);
  }

  async signup(name: string, email: string, password: string, department = 'General', role: 'student' | 'admin' = 'student'): Promise<AuthTokens> {
    const cleanEmail = email.toLowerCase().trim();
    // Role is always assigned server-side; frontend-requested admin role is ignored unless email is in ADMIN_EMAILS
    const assignedRole = this.isAuthorizedAdmin(cleanEmail) ? 'admin' : 'student';

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        throw new Error('An account with this email address already exists.');
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        department: department.trim(),
        authProvider: 'local',
        isActive: true,
        lastLoginAt: new Date(),
      });

      const token = this.generateToken(user);
      return {
        token,
        user: this.formatUser(user),
      };
    }

    // In-memory fallback
    for (const u of memoryDb.users.values()) {
      if (u.email === cleanEmail) {
        throw new Error('An account with this email address already exists.');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newId = new mongoose.Types.ObjectId().toString();

    const userObj = {
      _id: new mongoose.Types.ObjectId(newId),
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      department: department.trim(),
      authProvider: 'local',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, passwordHash),
    };

    memoryDb.users.set(newId, userObj);

    return {
      token: this.generateToken(userObj),
      user: this.formatUser(userObj),
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = this.generateToken(user);
      return {
        token,
        user: this.formatUser(user),
      };
    }

    // In-memory fallback lookup
    let foundUser: any = null;
    for (const u of memoryDb.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await foundUser.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    foundUser.lastLoginAt = new Date();

    const token = this.generateToken(foundUser);
    return {
      token,
      user: this.formatUser(foundUser),
    };
  }

  /**
   * Google OAuth authentication.
   *
   * SECURITY: Only accepts a verified Google ID token (`credential` field).
   * Raw email/name/googleId without a credential are REJECTED to prevent identity spoofing.
   * The credential is verified using Google's public keys via verifyIdToken().
   */
  async googleAuth(data: { credential?: string }): Promise<AuthTokens> {
    if (!data.credential) {
      throw new Error('A valid Google credential token is required for Google Sign-In.');
    }

    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error('Google OAuth is not configured on this server. Please contact the administrator.');
    }

    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPicture = '';
    let verifiedGoogleId = '';

    // Verify Google credential ID token cryptographically using Google's public keys
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Google credential did not contain a valid email address.');
      }
      verifiedEmail = payload.email;
      verifiedName = payload.name || payload.given_name || payload.email.split('@')[0];
      verifiedPicture = payload.picture || '';
      verifiedGoogleId = payload.sub;
      logger.info(`Google credential verified for: ${verifiedEmail}`);
    } catch (err: any) {
      logger.error(`Google verifyIdToken failed: ${err.message}`);
      throw new Error('Google credential verification failed. Please try signing in again.');
    }

    const cleanEmail = verifiedEmail.toLowerCase().trim();
    const finalName = verifiedName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    // Role is always assigned server-side; ADMIN_EMAILS controls admin access
    const assignedRole = this.isAuthorizedAdmin(cleanEmail) ? 'admin' : 'student';

    logger.info(`Authenticating verified Google user: ${cleanEmail} (Role: ${assignedRole})`);

    if (isDbConnected()) {
      let user = await User.findOne({ $or: [{ googleId: verifiedGoogleId }, { email: cleanEmail }] });

      if (user) {
        // Update existing user with latest Google profile data
        if (!user.googleId) user.googleId = verifiedGoogleId;
        if (verifiedPicture) {
          user.profilePicture = verifiedPicture;
          user.avatar = verifiedPicture;
        }
        user.authProvider = 'google';
        user.lastLoginAt = new Date();
        // Re-check admin status in case ADMIN_EMAILS was updated
        if (this.isAuthorizedAdmin(cleanEmail)) {
          user.role = 'admin';
        }
        await user.save();
      } else {
        // Create new user with verified Google identity
        user = await User.create({
          name: finalName,
          email: cleanEmail,
          googleId: verifiedGoogleId,
          profilePicture: verifiedPicture,
          avatar: verifiedPicture,
          authProvider: 'google',
          role: assignedRole,
          department: 'General',
          isActive: true,
          lastLoginAt: new Date(),
        });
        logger.info(`New user created via Google OAuth: ${cleanEmail}`);
      }

      const token = this.generateToken(user);
      return {
        token,
        user: this.formatUser(user),
      };
    }

    // In-memory DB fallback (development without MongoDB)
    let foundUser: any = null;
    for (const u of memoryDb.users.values()) {
      if (u.email.toLowerCase() === cleanEmail || u.googleId === verifiedGoogleId) {
        foundUser = u;
        break;
      }
    }

    if (foundUser) {
      foundUser.googleId = verifiedGoogleId;
      if (verifiedPicture) {
        foundUser.profilePicture = verifiedPicture;
        foundUser.avatar = verifiedPicture;
      }
      foundUser.authProvider = 'google';
      foundUser.lastLoginAt = new Date();
      if (this.isAuthorizedAdmin(cleanEmail)) {
        foundUser.role = 'admin';
      }
    } else {
      const newId = new mongoose.Types.ObjectId().toString();
      foundUser = {
        _id: new mongoose.Types.ObjectId(newId),
        id: newId,
        name: finalName,
        email: cleanEmail,
        googleId: verifiedGoogleId,
        profilePicture: verifiedPicture,
        avatar: verifiedPicture,
        authProvider: 'google',
        role: assignedRole,
        department: 'General',
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
      };
      memoryDb.users.set(newId, foundUser);
      logger.info(`New user created via Google OAuth (in-memory): ${cleanEmail}`);
    }

    const token = this.generateToken(foundUser);
    return {
      token,
      user: this.formatUser(foundUser),
    };
  }
}

export const authService = new AuthService();
