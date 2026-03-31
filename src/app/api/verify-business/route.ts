import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { businessNumber, ownerName, startDate } = await req.json();

  if (!businessNumber || !ownerName || !startDate) {
    return NextResponse.json({ error: "사업자번호, 대표자명, 개업일을 모두 입력해주세요." }, { status: 400 });
  }

  const b_no = businessNumber.replace(/[^0-9]/g, "");
  if (b_no.length !== 10) {
    return NextResponse.json({ error: "사업자번호 10자리를 입력해주세요." }, { status: 400 });
  }

  const start_dt = startDate.replace(/-/g, "");
  if (start_dt.length !== 8) {
    return NextResponse.json({ error: "개업일을 정확히 입력해주세요." }, { status: 400 });
  }

  const apiKey = process.env.NTS_API_KEY;
  const url = `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      businesses: [{ b_no, p_nm: ownerName, start_dt }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "국세청 API 호출에 실패했습니다." }, { status: 502 });
  }

  const data = await res.json();
  const item = data?.data?.[0];

  if (!item) {
    return NextResponse.json({ verified: false, message: "인증 결과를 확인할 수 없습니다." });
  }

  const verified = item.valid === "01";

  return NextResponse.json({
    verified,
    message: verified
      ? "사업자 인증이 완료되었습니다."
      : "사업자 정보가 일치하지 않습니다. 사업자번호, 대표자명, 개업일을 확인해주세요.",
  });
}
