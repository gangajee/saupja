import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일을 업로드해주세요." }, { status: 400 });
  }

  const invokeUrl = process.env.NAVER_OCR_INVOKE_URL;
  const secret = process.env.NAVER_OCR_SECRET;

  if (!invokeUrl || !secret) {
    return NextResponse.json({ error: "OCR 서비스가 설정되지 않았습니다." }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const format = ext === "png" ? "png" : ext === "pdf" ? "pdf" : "jpg";

  let ocrResult;
  try {
    const res = await fetch(invokeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OCR-SECRET": secret,
      },
      body: JSON.stringify({
        version: "V2",
        requestId: randomUUID(),
        timestamp: 0,
        images: [{ format, name: "file", data: base64 }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Naver OCR error:", errText);
      return NextResponse.json({ error: "OCR 분석 중 오류가 발생했습니다." }, { status: 502 });
    }

    ocrResult = await res.json();
  } catch (err) {
    console.error("Naver OCR fetch error:", err);
    return NextResponse.json({ error: "OCR 분석 중 오류가 발생했습니다." }, { status: 502 });
  }

  // 모든 텍스트 추출
  const fields: string[] = ocrResult?.images?.[0]?.fields?.map(
    (f: { inferText: string }) => f.inferText
  ) ?? [];
  const fullText = fields.join(" ");

  // 사업자등록번호: 000-00-00000 또는 숫자 10자리
  const bizNumMatch = fullText.match(/(\d{3})-(\d{2})-(\d{5})/);
  const businessNumber = bizNumMatch
    ? `${bizNumMatch[1]}${bizNumMatch[2]}${bizNumMatch[3]}`
    : "";

  // 개업연월일: YYYY년 MM월 DD일 또는 YYYY.MM.DD
  let startDate = "";
  const dateMatch1 = fullText.match(/(\d{4})[년.]\s*(\d{1,2})[월.]\s*(\d{1,2})일?/);
  if (dateMatch1) {
    startDate = `${dateMatch1[1]}-${dateMatch1[2].padStart(2, "0")}-${dateMatch1[3].padStart(2, "0")}`;
  }

  // 상호명: "상호" 다음 텍스트
  let companyName = "";
  const companyIdx = fields.findIndex((f) => f.includes("상호") || f.includes("법인명"));
  if (companyIdx !== -1 && fields[companyIdx + 1]) {
    companyName = fields[companyIdx + 1].trim();
  }

  // 대표자명: "성명" 또는 "대표자" 다음 텍스트
  let ownerName = "";
  const ownerIdx = fields.findIndex((f) => f.includes("성명") || f.includes("대표자"));
  if (ownerIdx !== -1 && fields[ownerIdx + 1]) {
    ownerName = fields[ownerIdx + 1].trim();
  }

  // 사업장 소재지: "소재지" 다음 텍스트
  let address = "";
  const addrIdx = fields.findIndex((f) => f.includes("소재지"));
  if (addrIdx !== -1 && fields[addrIdx + 1]) {
    address = fields[addrIdx + 1].trim();
  }

  return NextResponse.json({ companyName, ownerName, businessNumber, startDate, address });
}
