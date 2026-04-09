import { NextResponse } from "next/server";
import { createConsultationRequest } from "@/lib/crm-store";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        company?: string;
        revenue?: string;
        challenge?: string;
        focusArea?: string;
      }
    | null;

  const name = payload?.name?.trim() ?? "";
  const email = payload?.email?.trim() ?? "";
  const company = payload?.company?.trim() ?? "";
  const revenue = payload?.revenue?.trim() ?? "";
  const challenge = payload?.challenge?.trim() ?? "";
  const focusArea = payload?.focusArea?.trim() ?? "";

  if (!name || !email || !focusArea) {
    return NextResponse.json(
      { error: "Nome, email e prioridade principal são obrigatórios." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "O email não é válido." }, { status: 400 });
  }

  const saved = await createConsultationRequest({
    name,
    email,
    company,
    revenue,
    challenge,
    focusArea,
  });

  return NextResponse.json({ success: true, request: saved }, { status: 201 });
}
