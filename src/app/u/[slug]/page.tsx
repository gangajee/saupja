import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ShareClient from "@/components/ShareClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return { title: "찾을 수 없습니다" };
  return { title: `${business.companyName} — 사업자 정보` };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ShareClient business={business as any} />;
}