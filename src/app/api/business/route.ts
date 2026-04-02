import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businesses = await prisma.business.findMany({
    where: { userId },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { companyName, ownerName, businessNumber, address, phone, bankName, accountNumber, website, visibleFields, sharePassword } = data;

  if (!companyName || !ownerName || !businessNumber) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }

  // 사업자번호를 slug로 사용 (숫자만 추출)
  const slug = businessNumber.replace(/\D/g, "");

  if (!slug) {
    return NextResponse.json({ error: "유효한 사업자번호를 입력해주세요." }, { status: 400 });
  }

  // 중복 체크
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 사업자번호입니다." }, { status: 409 });
  }

  try {
    const business = await prisma.business.create({
      data: {
        slug,
        userId,
        companyName,
        ownerName,
        businessNumber,
        address,
        phone,
        bankName,
        accountNumber,
        website: website || null,
        visibleFields: visibleFields ? JSON.stringify(visibleFields) : JSON.stringify(["ownerName", "phone", "address", "account", "files"]),
        sharePassword: sharePassword || null,
      },
    });
    return NextResponse.json(business, { status: 201 });
  } catch (err) {
    console.error("[POST /api/business]", err);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}