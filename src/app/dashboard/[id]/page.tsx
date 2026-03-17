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

  const imageFiles = business.files.filter((f) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );
  const otherFiles = business.files.filter(
    (f) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName)
  );

  const shareUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/u/${business.slug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition p-1 -ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="font-semibold text-slate-900 text-sm">{business.companyName}</span>
          </div>
          <Link
            href={`/dashboard/edit?id=${business.id}`}
            className="text-sm text-slate-500 hover:text-slate-900 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            수정
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 pb-16 space-y-3">

        {/* 공유 링크 */}
        <div className="bg-slate-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">공유 링크</p>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200">
            <span className="text-sm text-slate-600 flex-1 truncate">{shareUrl}</span>
            <CopyButton value={shareUrl} />
          </div>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/u/${business.slug}`}
              target="_blank"
              className="flex-1 text-center text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 transition"
            >
              페이지 열기 ↗
            </Link>
            {business.files.length > 0 && (
              <a
                href={`/api/download-all?slug=${business.slug}`}
                className="flex-1 text-center text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl py-2.5 transition"
              >
                ZIP 다운로드
              </a>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="px-5 py-4 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">기본 정보</p>
          </div>
          <div className="divide-y divide-slate-50">
            <DetailRow label="상호명" value={business.companyName} />
            <DetailRow label="대표자명" value={business.ownerName} />
            <DetailRow
              label="사업자번호"
              value={formatBusinessNumber(business.businessNumber)}
              copyValue={business.businessNumber}
            />
            {business.phone && <DetailRow label="전화번호" value={business.phone} />}
            {business.address && <DetailRow label="주소" value={business.address} />}
            {business.bankName && <DetailRow label="은행" value={business.bankName} />}
            {business.accountNumber && (
              <DetailRow label="계좌번호" value={business.accountNumber} copyValue={business.accountNumber} />
            )}
          </div>
        </div>

        {/* 이미지 파일 */}
        {imageFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                첨부 이미지 <span className="text-slate-300 font-normal">({imageFiles.length})</span>
              </p>
            </div>
            <div className="p-5 space-y-5">
              {imageFiles.map((file) => (
                <div key={file.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-800">{file.label}</p>
                    <a
                      href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`}
                      className="text-xs text-blue-500 font-medium hover:underline"
                    >
                      다운로드
                    </a>
                  </div>
                  <ImagePreview src={file.url} alt={file.label} fileName={file.fileName} />
                  <p className="text-xs text-slate-300 mt-2">{formatFileSize(file.fileSize)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF 및 기타 파일 */}
        {otherFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100">
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                첨부 서류 <span className="text-slate-300 font-normal">({otherFiles.length})</span>
              </p>
            </div>
            <div className="divide-y divide-slate-50">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                      {file.fileName.split(".").pop()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{file.label}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{formatFileSize(file.fileSize)}</p>
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

        {business.files.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 px-5 py-10 text-center">
            <p className="text-slate-300 text-sm mb-3">첨부된 파일이 없습니다.</p>
            <Link
              href={`/dashboard/edit?id=${business.id}`}
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              파일 추가하기 →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <span className="text-xs text-slate-400 shrink-0 w-20">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-sm font-medium text-slate-900 text-right">{value}</span>
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}