import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { store } from '../data/mockStore';
import { AuthRequest } from '../middlewares/auth';
import { User } from '@seait-stay/types';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['student', 'owner', 'admin']).default('student'),
  phone: z.string().optional(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  yearLevel: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = store.findUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      studentId: data.studentId,
      department: data.department,
      yearLevel: data.yearLevel,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
      isVerified: data.role === 'student', // Students verified by default or SEAIT ID, owners require document verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.addUser(newUser, passwordHash);

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, env.JWT_SECRET, {
      expiresIn: '7d'
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: newUser.id,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: 'USER_REGISTERED',
      entityType: 'user',
      entityId: newUser.id,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const hash = store.getUserPasswordHash(user.id);
    if (!hash) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  return res.json({
    success: true,
    data: req.user
  });
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const updates = req.body;
    const allowed = ['fullName', 'phone', 'avatarUrl', 'studentId', 'department', 'yearLevel'];
    const filteredUpdates: Record<string, any> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedUser = store.updateUser(req.user.id, filteredUpdates);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
}
