import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'admin_session';

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// A deterministic token derived from the admin password + a server-only
// secret. There's no session database: the cookie itself IS the proof of
// login, and it's verified by recomputing the same hash on each request.
function computeSessionToken(): string {
  const password = getEnvOrThrow('ADMIN_PASSWORD');
  const secret = getEnvOrThrow('SESSION_SECRET');
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  return timingSafeStringEqual(candidate, expected);
}

export function getSessionToken(): string {
  return computeSessionToken();
}

// Call only from Server Components, Route Handlers, or Server Actions.
export function isAdmin(): boolean {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    return timingSafeStringEqual(token, computeSessionToken());
  } catch {
    return false;
  }
}
