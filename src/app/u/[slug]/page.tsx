import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatBusinessNumber, formatFileSize } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";
import ImagePreview from "@/components/ImagePreview";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug } });
  if (!business) return { title: "찾을 수 없습니다" };
  return { title: `${business.companyName} — 사업자 정보` };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  if (!business) notFound();

  const imageFiles = business.files.filter((f) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );
  const otherFiles = business.files.filter(
    (f) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 pb-10">
      <div className="max-w-lg mx-auto space-y-4">
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{business.companyName}</h1>
            <p className="text-gray-500 text-sm mt-1">사업자 정보</p>
          </div>

          <div className="space-y-3">
            <InfoRow label="대표자" value={business.ownerName} />
            <InfoRow
              label="사업자번호"
              value={formatBusinessNumber(business.businessNumber)}
              copyValue={business.businessNumber}
            />
            {business.address && <InfoRow label="주소" value={business.address} />}
            {business.phone && <InfoRow label="전화번호" value={business.phone} />}
            {business.bankName && business.accountNumber && (
              <InfoRow
                label="계좌번호"
                value={`${business.bankName} ${business.accountNumber}`}
                copyValue={business.accountNumber}
              />
            )}
          </div>
        </div>

        {/* 전체 다운로드 */}
        {business.files.length > 0 && (
          <a
            href={`/api/download-all?slug=${business.slug}`}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3.5 rounded-2xl text-base font-medium active:bg-blue-700 transition"
          >
            전체 파일 ZIP 다운로드 ({business.files.length}개)
          </a>
        )}

        {/* 이미지 파일 */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-4">첨부 이미지</h2>
            <div className="space-y-4">
              {imageFiles.map((file) => (
                <div key={file.id} className="space-y-2">
                  <p className="text-sm font-medium">{file.label}</p>
                  <ImagePreview src={file.url} alt={file.label} fileName={file.fileName} />
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
          </div>
        )}

        {/* PDF 및 기타 파일 */}
        {otherFiles.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">첨부 서류</h2>
            <div className="space-y-2">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center text-xs font-bold text-red-500 uppercase">
                      {file.fileName.split(".").pop()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.label}</p>
                      <p className="text-xs text-gray-400">{file.fileName} · {formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                    className="text-sm text-blue-600 hover:underline shrink-0"
                  >
                    다운로드
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          saupja.com으로 만든 사업자 정보 페이지
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: string;
  copyValue?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-medium text-right">{value}</span>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}
