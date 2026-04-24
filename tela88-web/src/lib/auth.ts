import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { selectSingle } from "@/lib/supabase-rest";
import type { AuthenticatedUser, InternalUserRole, TeamMemberStatus } from "@/lib/crm-types";

const sessionCookieName = "tela88_admin_session";

type InternalUserRow = {
  id: string;
  username: string;
  email: string;
  name: string;
  role: InternalUserRole;
  function_role: string;
  status: TeamMemberStatus;
  daily_capacity: string;
  password_hash: string;
};

function getSessionSecret() {
  return process.env.TELA88_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-session-secret-change-me";
}

function createSignature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function encodePayload(payload: object) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload<T>(payload: string) {
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
}

function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedHash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64).toString("hex");
  const provided = Buffer.from(derivedHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function mapUser(row: InternalUserRow): AuthenticatedUser {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    functionRole: row.function_role,
  };
}

export async function validateUserCredentials(username: string, password: string) {
  const user = await selectSingle<InternalUserRow>("internal_users", {
    filters: { username },
  });

  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return mapUser(user);
}

export function createSessionToken(user: AuthenticatedUser) {
  const secret = getSessionSecret();
  const payload = encodePayload({
    user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
  const signature = createSignature(payload, secret);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const secret = getSessionSecret();
  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;

  const expected = createSignature(payload, secret);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (provided.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(provided, expectedBuffer)) return null;

  try {
    const decoded = decodePayload<{ user: AuthenticatedUser; expiresAt: number }>(payload);

    if (decoded.expiresAt < Date.now()) return null;
    return decoded.user;
  } catch {
    return null;
  }
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
      errorResponse: NextResponse.json({ error: "Nao autorizado." }, { status: 401 }),
    };
  }

  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (origin && origin !== requestOrigin) {
    return {
      admin: null,
      errorResponse: NextResponse.json({ error: "Origem invalida." }, { status: 403 }),
    };
  }

  return {
    admin,
    errorResponse: null,
  };
}
