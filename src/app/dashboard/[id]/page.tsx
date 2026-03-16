import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatBusinessNumber, formatFileSize } from "@/lib/utils";
import ImagePreview from "@/components/ImagePreview";
import CopyButton from "@/components/CopyButton";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business || business.userId !== userId) notFound();

  const imageFiles = business.files.filter((f: { fileName: string }) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );
  const otherFiles = business.files.filter(
    (f: { fileName: string }) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">
              ← 대시보드
            </Link>
            <h1 className="font-semibold">{business.companyName}</h1>
          </div>
          <Link
            href={`/dashboard/edit?id=${business.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            수정
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
            <InfoRow label="상호명" value={business.companyName} />
            <InfoRow label="대표자명" value={business.ownerName} />
            <InfoRow
              label="사업자번호"
              value={formatBusinessNumber(business.businessNumber)}
            />
            {business.phone && <InfoRow label="전화번호" value={business.phone} />}
            {business.address && (
              <InfoRow label="주소" value={business.address} className="sm:col-span-2" />
            )}
            {business.bankName && (
              <InfoRow label="은행명" value={business.bankName} />
            )}
            {business.accountNumber && (
              <InfoRow label="계좌번호" value={business.accountNumber} copyValue={business.accountNumber} />
            )}
          </div>
        </section>

        {/* 이미지 파일 미리보기 */}
        {imageFiles.length > 0 && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">
              첨부 이미지 ({imageFiles.length}개)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageFiles.map((file) => (
                <div key={file.id} className="space-y-2">
                  <p className="text-sm font-medium">{file.label}</p>
                  <ImagePreview
                    src={file.url}
                    alt={file.label}
                    fileName={file.fileName}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                    <a
                      href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      다운로드
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PDF 및 기타 파일 */}
        {otherFiles.length > 0 && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">
              첨부 서류 ({otherFiles.length}개)
            </h2>
            <div className="space-y-2">
              {otherFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs font-bold text-red-500 uppercase">
                      {file.fileName.split(".").pop()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.label}</p>
                      <p className="text-xs text-gray-400">
                        {file.fileName} · {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    다운로드
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {business.files.length === 0 && (
          <section className="bg-white rounded-xl border p-6 text-center text-gray-400 text-sm">
            첨부된 파일이 없습니다.{" "}
            <Link href={`/dashboard/edit?id=${business.id}`} className="text-blue-600 hover:underline">
              파일 추가하기
            </Link>
          </section>
        )}

        {/* 전체 다운로드 */}
        {business.files.length > 0 && (
          <a
            href={`/api/download-all?slug=${business.slug}`}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            전체 파일 ZIP 다운로드 ({business.files.length}개)
          </a>
        )}

        {/* 공유 링크 */}
        <section className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">공유 링크</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700 flex-1 break-all">
              {process.env.AUTH_URL ?? "http://localhost:3000"}/u/{business.slug}
            </span>
            <Link
              href={`/u/${business.slug}`}
              target="_blank"
              className="text-sm text-blue-600 hover:underline shrink-0"
            >
              열기
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyValue,
  className,
}: {
  label: string;
  value: string;
  copyValue?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{value}</p>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}
