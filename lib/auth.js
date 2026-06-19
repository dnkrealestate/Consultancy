import jwt from 'jsonwebtoken';
import dbConnect from './db';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ------------------------------------------------------------
// Resolve the currently authenticated user from the request cookie.
// Returns the full (password-stripped) Mongoose user document, or null.
// Use this in API route handlers to enforce role/module rules.
// ------------------------------------------------------------
export async function getAuthUser(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.id) return null;

  await dbConnect();
  const user = await User.findById(decoded.id).select('-password');
  if (!user || user.active === false) return null;

  return user;
}