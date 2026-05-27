import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "team-fund-auth";
const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-please-set-env-var"
);

export async function createAuthToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(AUTH_SECRET);
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, AUTH_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  const correctPassword = process.env.TEAM_FUND_PASSWORD;
  if (!correctPassword) {
    console.error("TEAM_FUND_PASSWORD not configured");
    return false;
  }
  return password === correctPassword;
}
