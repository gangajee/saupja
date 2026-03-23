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
  const imageUrl = rawImage?.startsWith("http") ? rawImage : rawImage ? `${baseUrl}${rawImage}` : null;
  const hasImage = !!imageUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* 좌측 콘텐츠 영역 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
          }}
        >
          {/* 브랜드 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#0f172a",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
              saupja.com
            </span>
          </div>

          {/* 메인 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl!}
                alt="logo"
                width={120}
                height={120}
                style={{ borderRadius: "16px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#f1f5f9",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                }}
              >
                🏢
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              <span style={{ fontSize: "56px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                {name}
              </span>
              {owner && (
                <span style={{ fontSize: "24px", color: "#94a3b8" }}>
                  대표 {owner}
                </span>
              )}
            </div>
          </div>

          {/* 하단 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                background: "#f1f5f9",
                color: "#64748b",
                fontSize: "14px",
                padding: "6px 14px",
                borderRadius: "100px",
              }}
            >
              사업자 정보 확인하기
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
