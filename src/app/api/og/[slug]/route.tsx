import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: { companyName: true, ownerName: true, profileImage: true },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const name = business?.companyName ?? "사업자";
  const owner = business?.ownerName ?? "";
  const rawImage = business?.profileImage;
  const imageUrl = rawImage?.startsWith("http") ? rawImage : rawImage?.startsWith("data:") ? null : rawImage ? `${baseUrl}${rawImage}` : null;

  const res = new ImageResponse(
    (
      <div
        style={{
          width: "800px",
          height: "800px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          fontFamily: "sans-serif",
          gap: "32px",
        }}
      >
        {/* 아바타 */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="logo"
            width={180}
            height={180}
            style={{ borderRadius: "36px", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "180px",
              height: "180px",
              background: "#dbeafe",
              borderRadius: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "96px",
              fontWeight: 800,
              color: "#2563eb",
            }}
          >
            {name.charAt(0)}
          </div>
        )}

        {/* 회사명 + 대표 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "64px", fontWeight: 800, color: "#0f172a", textAlign: "center", lineHeight: 1.1 }}>
            {name}
          </span>
          {owner && (
            <span style={{ fontSize: "28px", color: "#94a3b8" }}>
              대표 {owner}
            </span>
          )}
        </div>

        {/* 브랜드 */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "#0f172a",
              borderRadius: "6px",
            }}
          />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#94a3b8" }}>
            saupja.biz
          </span>
        </div>
      </div>
    ),
    { width: 800, height: 800 }
  );
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400");
  return res;
}