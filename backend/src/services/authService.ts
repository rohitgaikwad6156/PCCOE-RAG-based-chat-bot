import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
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
    authProvider?: string;
  };
}

export class AuthService {
  generateToken(user: any): string {
    const userId = user._id ? user._id.toString() : user.id;
    return jwt.sign(
      { userId, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  formatUser(user: any) {
    const id = user._id ? user._id.toString() : user.id;
    return {
      id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar || '',
      authProvider: user.authProvider || 'local',
    };
  }

  async signup(name: string, email: string, password: string, department = 'General', role: 'student' | 'admin' = 'student'): Promise<AuthTokens> {
    const cleanEmail = email.toLowerCase().trim();

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
        role,
        department: department.trim(),
        authProvider: 'local',
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
      role,
      department: department.trim(),
      authProvider: 'local',
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

    const token = this.generateToken(foundUser);
    return {
      token,
      user: this.formatUser(foundUser),
    };
  }

  async googleAuth(data: { credential?: string; email?: string; name?: string; picture?: string; googleId?: string }): Promise<AuthTokens> {
    let email = data.email;
    let name = data.name;
    let picture = data.picture || '';
    let googleId = data.googleId || '';

    // If client passed Google JWT credential, decode it safely
    if (data.credential && !email) {
      try {
        const base64Url = data.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        const payload = JSON.parse(jsonPayload);

        email = payload.email;
        name = payload.name || payload.given_name || payload.email.split('@')[0];
        picture = payload.picture || '';
        googleId = payload.sub || '';
      } catch (err: any) {
        logger.warn(`Could not decode Google credential JWT: ${err.message}`);
      }
    }

    if (!email) {
      throw new Error('Google authentication failed: Email is required.');
    }

    const cleanEmail = email.toLowerCase().trim();
    const finalName = name || cleanEmail.split('@')[0];

    logger.info(`Processing Google Sign-In for: ${cleanEmail}`);

    if (isDbConnected()) {
      let user = await User.findOne({ email: cleanEmail });

      if (user) {
        // Existing user - update Google metadata if not set
        if (!user.googleId && googleId) {
          user.googleId = googleId;
        }
        if (!user.avatar && picture) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // Create new user authenticated via Google
        user = await User.create({
          name: finalName,
          email: cleanEmail,
          googleId,
          avatar: picture,
          authProvider: 'google',
          role: 'student',
          department: 'General',
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
      foundUser.googleId = googleId || foundUser.googleId;
      foundUser.avatar = picture || foundUser.avatar;
    } else {
      const newId = new mongoose.Types.ObjectId().toString();
      foundUser = {
        _id: new mongoose.Types.ObjectId(newId),
        id: newId,
        name: finalName,
        email: cleanEmail,
        googleId,
        avatar: picture,
        authProvider: 'google',
        role: 'student',
        department: 'General',
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
