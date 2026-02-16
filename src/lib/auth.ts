// JWT token utilities for client-side token reading
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token (client-side, no verification)
 * Safe for reading non-sensitive claims only
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get auth token from document cookies
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Get user role from JWT token
 */
export function getUserRole(): string | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
}
