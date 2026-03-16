import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (business.files.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 });

  const zip = new JSZip();

  // 파일명 중복 방지용 카운터
  const nameCount: Record<string, number> = {};

  for (const file of business.files) {
    let buffer: Buffer;

    if (file.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", file.url);
      buffer = await readFile(filePath);
    } else {
      const res = await fetch(file.url);
      buffer = Buffer.from(await res.arrayBuffer());
    }

    // 중복 파일명 처리
    const key = file.fileName;
    nameCount[key] = (nameCount[key] ?? 0) + 1;
    const finalName =
      nameCount[key] > 1
        ? `${file.label}_${nameCount[key]}_${file.fileName}`
        : `${file.label}_${file.fileName}`;

    zip.file(finalName, buffer);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const zipName = `${business.companyName}_서류.zip`;

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
    },
  });
}
