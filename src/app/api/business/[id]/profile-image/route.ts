import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/storage";

const isR2Configured =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "2MB 이하 파일만 업로드 가능합니다." }, { status: 400 });
  }

  let url: string;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isR2Configured) {
    url = await uploadFile(buffer, file.name, file.type);
  } else {
    // R2 미설정 시 base64로 DB에 직접 저장
    url = `data:${file.type};base64,${buffer.toString("base64")}`;
  }

  await prisma.business.update({
    where: { id },
    data: { profileImage: url },
  });

  return NextResponse.json({ url });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.business.update({ where: { id }, data: { profileImage: null } });
  return NextResponse.json({ ok: true });
}
