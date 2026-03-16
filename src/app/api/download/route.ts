import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") ?? "file";

  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  // 로컬 파일 (/uploads/...)
  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Content-Type": "application/octet-stream",
      },
    });
  }

  // R2 등 외부 URL
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
    },
  });
}
