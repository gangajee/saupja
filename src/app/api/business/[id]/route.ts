import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
