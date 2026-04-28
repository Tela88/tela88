import { NextResponse } from "next/server";
import { createSessionToken, getAuthenticatedAdmin, getSessionCookieName } from "@/lib/auth";
import { updateUserProfile } from "@/lib/crm-store";

export async function PUT(request: Request) {
  const currentUser = await getAuthenticatedAdmin();

  if (!currentUser) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        avatarUrl?: string | null;
      }
    | null;

  const avatarUrl = payload?.avatarUrl ?? null;

  if (avatarUrl && avatarUrl.length > 1_500_000) {
    return NextResponse.json({ error: "Imagem demasiado grande." }, { status: 400 });
  }

  try {
    await updateUserProfile({
      id: currentUser.id,
      avatarUrl,
    });

    const refreshedUser = {
      ...currentUser,
      avatarUrl,
    };

    const response = NextResponse.json({ success: true, user: refreshedUser });
    response.cookies.set({
      name: getSessionCookieName(),
      value: createSessionToken(refreshedUser),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 400 },
    );
  }
}
