import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import crypto from 'crypto';

export const generateTokens = (user: Pick<User, 'id' | 'email' | 'role'>) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      tokenId: crypto.randomBytes(16).toString('hex')
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    userId: string;
    tokenId: string;
  };
};