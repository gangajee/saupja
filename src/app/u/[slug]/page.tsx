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

  const imageFiles = business.files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName));
  const otherFiles = business.files.filter((f) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 브랜드 바 */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 text-center">
        <span className="text-xs text-slate-300 tracking-wide">saupja.com</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 pb-16 space-y-4">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-slate-50">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">사업자 정보</p>
            <h1 className="text-xl font-bold text-slate-900">{business.companyName}</h1>
          </div>
          <div className="px-6 py-4 space-y-3">
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
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-slate-700 active:bg-slate-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            전체 파일 다운로드 ({business.files.length}개)
          </a>
        )}

        {/* 이미지 파일 */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-50">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">첨부 이미지</p>
            </div>
            <div className="px-6 py-4 space-y-5">
              {imageFiles.map((file) => (
                <div key={file.id}>
                  <p className="text-sm font-medium text-slate-700 mb-2">{file.label}</p>
                  <ImagePreview src={file.url} alt={file.label} fileName={file.fileName} />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-300">{formatFileSize(file.fileSize)}</p>
                    <a
                      href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                      className="text-xs text-blue-500 font-medium hover:underline"
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-50">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">첨부 서류</p>
            </div>
            <div className="px-4 py-3 space-y-1">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between px-2 py-3 rounded-xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-xs font-bold text-red-400 uppercase">
                      {file.fileName.split(".").pop()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{file.label}</p>
                      <p className="text-xs text-slate-300">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                    className="text-xs text-blue-500 font-medium hover:underline shrink-0"
                  >
                    다운로드
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pt-2">
          saupja.com으로 만든 사업자 정보 페이지
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}
