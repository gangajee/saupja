import { writeFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const isR2Configured =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY;

const r2 = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const key = `${Date.now()}-${fileName}`;

  if (r2) {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }

  // 로컬 저장소 (개발용)
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await writeFile(path.join(uploadDir, key), buffer);
  return `/uploads/${key}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (r2 && url.startsWith("http")) {
    const key = url.split("/").pop()!;
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    );
  }
  // 로컬 파일은 별도 삭제 불필요 (개발 환경)
}
