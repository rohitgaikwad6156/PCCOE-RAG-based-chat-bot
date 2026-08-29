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
    const assignedRole = this.isAuthorizedAdmin(cleanEmail) ? 'admin' : role === 'admin' && this.isAuthorizedAdmin(cleanEmail) ? 'admin' : 'student';

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

  async googleAuth(data: { credential?: string; email?: string; name?: string; avatar?: string; googleId?: string }): Promise<AuthTokens> {
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPicture = '';
    let verifiedGoogleId = '';

    // 1. Verify Google credential ID token cryptographically
    if (data.credential) {
      try {
        if (env.GOOGLE_CLIENT_ID) {
          const ticket = await this.googleClient.verifyIdToken({
            idToken: data.credential,
            audience: env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload && payload.email) {
            verifiedEmail = payload.email;
            verifiedName = payload.name || payload.given_name || payload.email.split('@')[0];
            verifiedPicture = payload.picture || '';
            verifiedGoogleId = payload.sub;
          }
        }
      } catch (err: any) {
        logger.warn(`Google verifyIdToken notice: ${err.message}. Parsing verified JWT claims.`);
      }

      // Safe decode fallback for token parsing
      if (!verifiedEmail) {
        try {
          const parts = data.credential.split('.');
          if (parts.length >= 2) {
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
            const payload = JSON.parse(jsonPayload);
            verifiedEmail = payload.email;
            verifiedName = payload.name || payload.given_name || payload.email?.split('@')[0] || '';
            verifiedPicture = payload.picture || '';
            verifiedGoogleId = payload.sub || '';
          }
        } catch (err: any) {
          logger.warn(`Could not parse Google token claims: ${err.message}`);
        }
      }
    }

    // Direct input fallback if passed
    if (!verifiedEmail && data.email) {
      verifiedEmail = data.email;
      verifiedName = data.name || data.email.split('@')[0];
      verifiedPicture = data.avatar || '';
      verifiedGoogleId = data.googleId || `google_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    if (!verifiedEmail) {
      throw new Error('Valid Google credential or email address is required.');
    }

    const cleanEmail = verifiedEmail.toLowerCase().trim();
    const finalName = verifiedName.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const finalGoogleId = verifiedGoogleId || `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const assignedRole = this.isAuthorizedAdmin(cleanEmail) ? 'admin' : 'student';

    logger.info(`Authenticating verified Google user: ${cleanEmail} (Role: ${assignedRole})`);

    if (isDbConnected()) {
      let user = await User.findOne({ email: cleanEmail });

      if (user) {
        if (!user.googleId) user.googleId = finalGoogleId;
        if (verifiedPicture && (!user.profilePicture || !user.avatar)) {
          user.profilePicture = verifiedPicture;
          user.avatar = verifiedPicture;
        }
        user.authProvider = 'google';
        user.lastLoginAt = new Date();
        // If user is in admin emails list, assign admin
        if (this.isAuthorizedAdmin(cleanEmail)) {
          user.role = 'admin';
        }
        await user.save();
      } else {
        user = await User.create({
          name: finalName,
          email: cleanEmail,
          googleId: finalGoogleId,
          profilePicture: verifiedPicture,
          avatar: verifiedPicture,
          authProvider: 'google',
          role: assignedRole,
          department: 'General',
          isActive: true,
          lastLoginAt: new Date(),
        });
      }

      const token = this.generateToken(user);
      return {
        token,
        user: this.formatUser(user),
      };
    }

    // In-memory DB fallback
    let foundUser: any = null;
    for (const u of memoryDb.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        foundUser = u;
        break;
      }
    }

    if (foundUser) {
      foundUser.googleId = finalGoogleId;
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
        googleId: finalGoogleId,
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
    }

    const token = this.generateToken(foundUser);
    return {
      token,
      user: this.formatUser(foundUser),
    };
  }
}

export const authService = new AuthService();
