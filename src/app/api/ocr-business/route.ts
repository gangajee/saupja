import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일을 업로드해주세요." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  let message;
  try {
    message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `이 사업자등록증 이미지에서 다음 정보를 추출해서 JSON으로만 응답해주세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "companyName": "상호명 (법인명)",
  "ownerName": "대표자명",
  "businessNumber": "사업자등록번호 (숫자만, 예: 1234567890)",
  "startDate": "개업연월일 (YYYY-MM-DD 형식)",
  "address": "사업장 소재지"
}

정보가 없거나 읽을 수 없는 경우 해당 필드는 빈 문자열("")로 반환하세요.`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "AI 분석 중 오류가 발생했습니다." }, { status: 502 });
  }

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found");
    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "이미지에서 정보를 추출할 수 없습니다." }, { status: 422 });
  }
}
