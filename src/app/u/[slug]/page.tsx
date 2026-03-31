import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ShareClient from "@/components/ShareClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return { title: "찾을 수 없습니다" };

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const ogImage = `${baseUrl}/api/og/${slug}`;
  const title = `${business.companyName} — 사업자 정보`;
  const description = `${business.ownerName} 대표 · saupja.biz`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
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