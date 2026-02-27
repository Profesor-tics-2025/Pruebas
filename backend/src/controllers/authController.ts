import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signToken = (id: string, email: string, role: string): string => {
  // @ts-ignore
  return jwt.sign({ sub: id, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const register = async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) return res.status(400).json({ error: 'Email ya registrado' });

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({ data: { ...input, passwordHash } });
  const token = signToken(user.id, user.email, user.role);

  res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
};

export const login = async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = signToken(user.id, user.email, user.role);
  res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
};
