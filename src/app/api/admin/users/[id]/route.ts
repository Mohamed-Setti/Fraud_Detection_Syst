import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // ... fetch user by id ...
  return NextResponse.json({ id, user: {} });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await req.json(); // e.g., { role: 'analyst', ... }
  // ... update logic ...

  return NextResponse.json({ ok: true, id });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // ... delete logic ...
  return NextResponse.json({ ok: true, id });
}