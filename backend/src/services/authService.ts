import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { isDbConnected } from '../config/database';
import { memoryDb } from '../config/memoryDb';

export interface AuthTokens {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    department: string;
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
}

export const authService = new AuthService();
