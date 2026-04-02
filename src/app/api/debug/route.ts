import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const files = await prisma.businessFile.findMany({
    select: { id: true, url: true, fileName: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    files,
  });
}
