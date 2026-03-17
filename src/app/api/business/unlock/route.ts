import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json();

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!business.sharePassword || business.sharePassword !== password) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, business });
}