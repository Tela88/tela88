import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieName, validateAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null;

  const username = payload?.username?.trim() ?? "";
  const password = payload?.password?.trim() ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Preenche o utilizador e a palavra-passe." }, { status: 400 });
  }

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: getSessionCookieName(),
    value: createSessionToken(username),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
