import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business || business.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(business);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        companyName: data.companyName,
        ownerName: data.ownerName,
        businessNumber: data.businessNumber,
        address: data.address,
        phone: data.phone,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        website: data.website || null,
        visibleFields: data.visibleFields ? JSON.stringify(data.visibleFields) : business.visibleFields,
        sharePassword: data.sharePassword ?? business.sharePassword,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/business/:id]", err);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}