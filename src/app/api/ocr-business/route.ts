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

  // 알려진 레이블 키워드 (다음 레이블 나오면 수집 종료)
  const LABEL_KEYWORDS = ["상호", "법인명", "성명", "대표자", "소재지", "등록번호", "개업", "사업의종류", "업태", "종목"];

  // 레이블 idx 이후 ~ 다음 레이블 전까지 값을 모아 반환
  function collectValue(idx: number): string {
    const parts: string[] = [];
    for (let i = idx + 1; i < fields.length; i++) {
      const v = fields[i].trim();
      if (!v || v === ":" || v === ".") continue;
      if (LABEL_KEYWORDS.some((k) => v.includes(k))) break;
      parts.push(v);
      // 대표자명·소재지는 첫 값만
      if (idx === ownerIdx || idx === addrIdx) break;
    }
    return parts.join(" ").trim();
  }

  const companyIdx = fields.findIndex((f) => f.includes("상호") || f.includes("법인명"));
  const ownerIdx = fields.findIndex((f) => f.includes("성명") || f.includes("대표자"));
  const addrIdx = fields.findIndex((f) => f.includes("소재지"));

  const companyName = companyIdx !== -1 ? collectValue(companyIdx) : "";
  const ownerName   = ownerIdx   !== -1 ? collectValue(ownerIdx)   : "";
  const address     = addrIdx    !== -1 ? collectValue(addrIdx)    : "";

  return NextResponse.json({ companyName, ownerName, businessNumber, startDate, address });
}
