import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const result: Record<string, unknown> = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  // 1. Business 쿼리 테스트
  try {
    const count = await prisma.business.count();
    result.business_count = count;
    result.business_ok = true;
  } catch (e) {
    result.business_ok = false;
    result.business_error = String(e);
  }

  // 2. getSession 테스트
  try {
    const session = await getSession();
    result.session_ok = true;
    result.session_user_id = (session?.user as { id?: string })?.id ?? null;
  } catch (e) {
    result.session_ok = false;
    result.session_error = String(e);
  }

  return NextResponse.json(result);
}
