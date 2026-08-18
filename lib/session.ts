import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "portfolio_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET environment variable");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Builds the signed cookie value: `${expiresAt}.${signature}` */
export function createSessionValue(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

/** Pure function — safe to call from proxy.ts (no Next.js server APIs). */
export function verifySession(cookieValue: string | undefined | null): boolean {
  if (!cookieValue) return false;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

/** Server-only helper for Server Actions / Route Handlers — throws when unauthorized. */
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!verifySession(value)) {
    throw new Error("unauthorized");
  }
}

/** Server-only helper for Route Handlers that want a boolean instead of a throw. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}
