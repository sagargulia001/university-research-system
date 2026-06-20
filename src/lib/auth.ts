// Client-side JWT helpers. Decode only; do not use these for authorization.
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

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

export function getUserRole(): string | null {
  const token = getTokenFromCookie();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
}
