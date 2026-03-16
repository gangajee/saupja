import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const label = formData.get("label") as string;

  if (!file || !type || !label) {
    return NextResponse.json({ error: "파일과 종류를 선택해주세요." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(buffer, file.name, file.type);

  const businessFile = await prisma.businessFile.create({
    data: {
      businessId: id,
      type,
      label,
      url,
      fileName: file.name,
      fileSize: file.size,
    },
  });

  return NextResponse.json(businessFile, { status: 201 });
}
