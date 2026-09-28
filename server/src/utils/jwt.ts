import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'maitri_plus_super_secure_jwt_secret_sih2026_key';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT access token valid for 7 Days
 */
export const signAccessToken = (payload: JwtTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode an access token
 */
export const verifyAccessToken = (token: string): JwtTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
};

// Aliases for compatibility
export const signToken = signAccessToken;
export const verifyToken = verifyAccessToken;
export type JwtPayload = JwtTokenPayload;
