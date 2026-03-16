import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { companyName, ownerName, businessNumber, address, phone, bankName, accountNumber } = data;

  if (!companyName || !ownerName || !businessNumber) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }

  const slug = generateSlug(companyName);

  const business = await prisma.business.create({
    data: {
      slug,
      userId: session.user.id,
      companyName,
      ownerName,
      businessNumber,
      address,
      phone,
      bankName,
      accountNumber,
    },
  });

  return NextResponse.json(business, { status: 201 });
}
