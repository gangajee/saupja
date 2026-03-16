import { NextRequest, NextResponse } from "next/server";

const STATUS: Record<string, string> = {
  "01": "계속사업자",
  "02": "휴업자",
  "03": "폐업자",
};

export async function POST(req: NextRequest) {
  const { businessNumber } = await req.json();
  if (!businessNumber) {
    return NextResponse.json({ error: "사업자번호를 입력해주세요." }, { status: 400 });
  }

  const b_no = businessNumber.replace(/[^0-9]/g, "");
  if (b_no.length !== 10) {
    return NextResponse.json({ error: "사업자번호 10자리를 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.NTS_API_KEY;
  const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ b_no: [b_no] }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "국세청 API 호출에 실패했습니다." }, { status: 502 });
  }

  const data = await res.json();
  const item = data?.data?.[0];

  if (!item || !item.b_stt_cd) {
    return NextResponse.json({ verified: false, message: "등록되지 않은 사업자번호입니다." });
  }

  const statusLabel = STATUS[item.b_stt_cd] ?? item.b_stt ?? "알 수 없음";
  const isActive = item.b_stt_cd === "01";

  return NextResponse.json({
    verified: isActive,
    status: item.b_stt_cd,
    statusLabel,
    taxType: item.tax_type,
    message: isActive ? "정상 사업자입니다." : `${statusLabel} 사업자입니다.`,
  });
}
