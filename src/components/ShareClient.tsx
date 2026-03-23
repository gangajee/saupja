"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import ImagePreview from "@/components/ImagePreview";
import { formatFileSize } from "@/lib/utils";

type BusinessFile = {
  id: string;
  label: string;
  url: string;
  fileName: string;
  fileSize: number;
};

type Business = {
  companyName: string;
  ownerName: string;
  businessNumber: string;
  address: string | null;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
  profileImage: string | null;
  visibleFields: string | null;
  sharePassword: string | null;
  slug: string;
  files: BusinessFile[];
};

function formatBusinessNumber(n: string) {
  const d = n.replace(/\D/g, "");
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  return n;
}


const MASKED = "•••••••••";

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-slate-400 hover:text-slate-700 transition flex items-center gap-1"
    >
      {copied ? "복사됨 ✓" : "링크 복사"}
    </button>
  );
}

export default function ShareClient({ business: initial }: { business: Business }) {
  const visibleFields: string[] = (() => {
    try { return JSON.parse(initial.visibleFields ?? "[]"); } catch { return []; }
  })();

  const hasPassword = !!initial.sharePassword;
  const hasHidden = initial.visibleFields
    ? ["ownerName", "phone", "address", "account", "files"].some((f) => !visibleFields.includes(f))
    : false;

  const [unlocked, setUnlocked] = useState(false);
  const [business, setBusiness] = useState(initial);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const isVisible = (field: string) => unlocked || visibleFields.includes(field);

  async function handleUnlock() {
    setUnlocking(true);
    setPwError("");
    const res = await fetch("/api/business/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: business.slug, password }),
    });
    setUnlocking(false);
    if (!res.ok) {
      const data = await res.json();
      setPwError(data.error ?? "오류가 발생했습니다.");
      return;
    }
    const data = await res.json();
    setBusiness(data.business);
    setUnlocked(true);
    setShowInput(false);
  }

  const imageFiles = business.files.filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName));
  const otherFiles = business.files.filter((f) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f.fileName));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 브랜드 바 */}
      <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 tracking-widest uppercase">saupja.com</span>
        <div className="flex items-center gap-3">
          <CopyLinkButton />
          <a href="/" className="text-xs text-slate-400 hover:text-slate-700 transition">서비스 소개 →</a>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10 pb-20 space-y-4">

        {/* 회사 헤더 */}
        <div className="pb-2 flex items-center gap-4">
          {business.profileImage ? (
            <img src={business.profileImage} alt="로고" className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">사업자 정보</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{business.companyName}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {isVisible("ownerName") ? `${business.ownerName} 대표` : <span className="text-slate-200 select-none">{MASKED} 대표</span>}
            </p>
          </div>
        </div>

        {/* 비공개 잠금 해제 배너 */}
        {hasHidden && hasPassword && !unlocked && (
          <div className="border border-slate-200 rounded-2xl p-4">
            {!showInput ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">일부 정보가 비공개입니다</p>
                  <p className="text-xs text-slate-400 mt-0.5">비밀번호를 입력하면 전체 정보를 볼 수 있습니다.</p>
                </div>
                <button
                  onClick={() => setShowInput(true)}
                  className="shrink-0 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
                >
                  잠금 해제
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">비밀번호 입력</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="비밀번호"
                    autoFocus
                  />
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking || !password}
                    className="shrink-0 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition"
                  >
                    {unlocking ? "확인 중..." : "확인"}
                  </button>
                </div>
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              </div>
            )}
          </div>
        )}

        {unlocked && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            전체 정보가 공개되었습니다.
          </div>
        )}

        {/* 핵심 정보 */}
        <div className="border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden">
          <InfoRow label="사업자번호" value={formatBusinessNumber(business.businessNumber)} copyValue={business.businessNumber} visible />
          {business.phone && <InfoRow label="전화번호" value={business.phone} visible={isVisible("phone")} />}
          {business.address && <InfoRow label="주소" value={business.address.replace(/^\(\d{5}\) /, "").replace(" | ", " ")} visible={isVisible("address")} />}
          {business.bankName && business.accountNumber && (
            <InfoRow
              label="계좌번호"
              value={`${business.bankName} ${business.accountNumber}`}
              copyValue={business.accountNumber}
              visible={isVisible("account")}
            />
          )}
        </div>

        {/* 전체 다운로드 */}
        {business.files.length > 0 && isVisible("files") && (
          <a
            href={`/api/download-all?slug=${business.slug}`}
            className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-semibold hover:bg-slate-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            전체 서류 다운로드 ({business.files.length}개)
          </a>
        )}

        {/* 파일이 비공개일 때 */}
        {business.files.length > 0 && !isVisible("files") && (
          <div className="border border-slate-100 rounded-2xl p-5 text-center">
            <p className="text-sm text-slate-300 select-none">첨부 서류는 비공개입니다.</p>
          </div>
        )}

        {/* 이미지 파일 */}
        {imageFiles.length > 0 && isVisible("files") && (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">첨부 이미지</p>
            </div>
            <div className="p-4 grid grid-cols-4 gap-2">
              {imageFiles.map((file) => (
                <ImagePreview key={file.id} src={file.url} alt={file.label} fileName={file.fileName} downloadUrl={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`} label={file.label} />
              ))}
            </div>
          </div>
        )}

        {/* PDF 및 기타 파일 */}
        {otherFiles.length > 0 && isVisible("files") && (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">첨부 서류</p>
            </div>
            <div className="divide-y divide-slate-50">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                      {file.fileName.split(".").pop()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{file.label}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <a href={`/api/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.fileName)}`} className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition shrink-0">다운로드</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-300">
          <a href="/" className="hover:text-slate-500 transition font-medium">saupja.com</a>으로 만든 사업자 정보 페이지
        </p>
      </footer>
    </div>
  );
}

function InfoRow({ label, value, copyValue, visible = true }: { label: string; value: string; copyValue?: string; visible?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <span className="text-xs text-slate-400 shrink-0 w-20">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        {visible ? (
          <>
            <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
            {copyValue && <CopyButton value={copyValue} />}
          </>
        ) : (
          <span className="text-sm font-semibold text-slate-200 select-none tracking-widest">•••••••</span>
        )}
      </div>
    </div>
  );
}