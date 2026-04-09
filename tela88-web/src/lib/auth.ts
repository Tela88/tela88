import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const sessionCookieName = "tela88_admin_session";

function getAdminConfig() {
  return {
    username: process.env.TELA88_ADMIN_USERNAME ?? "admin",
    password: process.env.TELA88_ADMIN_PASSWORD ?? "change-me",
    secret: process.env.TELA88_SESSION_SECRET ?? "dev-session-secret-change-me",
  };
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  return username === config.username && password === config.password;
}

export function createSessionToken(username: string) {
  const { secret } = getAdminConfig();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `${username}.${expiresAt}`;
  const signature = createSignature(payload, secret);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const { secret } = getAdminConfig();
  const [username, expiresAt, signature] = token.split(".");

  if (!username || !expiresAt || !signature) return null;

  const payload = `${username}.${expiresAt}`;
  const expected = createSignature(payload, secret);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (provided.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(provided, expectedBuffer)) return null;
  if (Number(expiresAt) < Date.now()) return null;

  return { username };
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export async function assertAdminActionRequest(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
    };
  }

  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (origin && origin !== requestOrigin) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: "Origem inválida." }, { status: 403 }),
    };
  }

  return {
    admin,
    errorResponse: null,
  };
}
