import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, fileId } = await params;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = await prisma.businessFile.findUnique({ where: { id: fileId } });
  if (!file || file.businessId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteFile(file.url);
  await prisma.businessFile.delete({ where: { id: fileId } });

  return NextResponse.json({ ok: true });
}
