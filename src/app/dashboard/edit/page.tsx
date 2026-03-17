"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import PostcodeSearch from "@/components/PostcodeSearch";

type BusinessFile = {
  id: string;
  type: string;
  label: string;
  url: string;
  fileName: string;
  fileSize: number;
};

type FormData = {
  companyName: string;
  ownerName: string;
  businessNumber: string;
  address: string;
  phone: string;
  bankName: string;
  accountNumber: string;
};

const INITIAL: FormData = {
  companyName: "",
  ownerName: "",
  businessNumber: "",
  address: "",
  phone: "",
  bankName: "",
  accountNumber: "",
};

const ALL_FIELDS = ["ownerName", "phone", "address", "account", "files"] as const;
type VisibleField = (typeof ALL_FIELDS)[number];

const FIELD_LABELS: Record<VisibleField, string> = {
  ownerName: "대표자명",
  phone: "전화번호",
  address: "사업장 주소",
  account: "계좌번호",
  files: "첨부 서류",
};

function splitAddress(address: string) {
  const match = address.match(/^\((\d{5})\) (.+?) \| (.*)$/);
  if (match) return { postcode: match[1], base: match[2], detail: match[3] };
  return { postcode: "", base: address, detail: "" };
}

function EditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState<FormData>(INITIAL);
  const [postcode, setPostcode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [files, setFiles] = useState<BusinessFile[]>([]);
  const [savedId, setSavedId] = useState<string | null>(id);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!id);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string; taxType?: string } | null>(null);
  const [visibleFields, setVisibleFields] = useState<VisibleField[]>([...ALL_FIELDS]);
  const [sharePassword, setSharePassword] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/business`)
      .then((r) => r.json())
      .then((list) => {
        const found = list.find((b: { id: string }) => b.id === id);
        if (found) {
          setForm(found);
          setFiles(found.files ?? []);
          const parsed = splitAddress(found.address ?? "");
          setPostcode(parsed.postcode);
          setBaseAddress(parsed.base);
          setDetailAddress(parsed.detail);
          if (found.visibleFields) {
            try { setVisibleFields(JSON.parse(found.visibleFields)); } catch { /* ignore */ }
          }
          if (found.sharePassword) setSharePassword(found.sharePassword);
        }
      });
  }, [id]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function toggleField(field: VisibleField) {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
    setSaved(false);
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    const res = await fetch("/api/verify-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessNumber: form.businessNumber }),
    });
    const data = await res.json();
    setVerifyResult(data);
    setVerifying(false);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const combined = baseAddress
      ? `(${postcode}) ${baseAddress} | ${detailAddress}`
      : form.address;

    const res = await fetch(savedId ? `/api/business/${savedId}` : "/api/business", {
      method: savedId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        address: combined,
        visibleFields,
        sharePassword: sharePassword || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "저장에 실패했습니다.");
      return;
    }

    const data = await res.json();
    setSavedId(data.id);
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 p-1 -ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-slate-900">{id ? "정보 수정" : "사업자 정보 등록"}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-5 pb-12 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">기본 정보</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "companyName", label: "상호명", placeholder: "홍길동전기", required: true },
                { name: "ownerName", label: "대표자명", placeholder: "홍길동", required: true },
                { name: "phone", label: "전화번호", placeholder: "02-0000-0000" },
              ].map(({ name, label, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    name={name}
                    value={form[name as keyof FormData]}
                    onChange={onChange}
                    required={required}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              {/* 사업자번호 + 인증 */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                  사업자번호 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    name="businessNumber"
                    value={form.businessNumber}
                    onChange={(e) => { onChange(e); setVerifyResult(null); }}
                    required
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="000-00-00000"
                  />
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying || !form.businessNumber}
                    className="shrink-0 px-3 py-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
                  >
                    {verifying ? "조회 중" : "인증"}
                  </button>
                </div>
                {verifyResult && (
                  <p className={`mt-1.5 text-xs flex items-center gap-1 ${verifyResult.verified ? "text-green-600" : "text-red-500"}`}>
                    {verifyResult.verified ? "✓" : "✗"} {verifyResult.message}
                    {verifyResult.taxType && <span className="text-slate-400 ml-1">({verifyResult.taxType})</span>}
                  </p>
                )}
              </div>

              {/* 주소 */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">사업장 주소</label>
                <div className="flex gap-2">
                  <input value={postcode} readOnly className="w-24 border border-slate-200 rounded-xl px-3 py-3 text-sm bg-slate-50 text-slate-400" placeholder="우편번호" />
                  <PostcodeSearch onSelect={(code, addr) => { setPostcode(code); setBaseAddress(addr); setDetailAddress(""); setSaved(false); }} />
                </div>
                <input value={baseAddress} readOnly className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-slate-50 text-slate-400" placeholder="기본 주소 (주소 검색 후 자동 입력)" />
                <input value={detailAddress} onChange={(e) => { setDetailAddress(e.target.value); setSaved(false); }} className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="상세 주소 (동/호수 등)" />
              </div>

              {/* 계좌 */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">은행명</label>
                <input name="bankName" value={form.bankName} onChange={onChange} className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="국민은행" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">계좌번호</label>
                <input name="accountNumber" value={form.accountNumber} onChange={onChange} className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="000-0000-0000-00" />
              </div>
            </div>
          </div>

          {/* 공개 설정 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">공개 설정</p>
            <p className="text-xs text-slate-400">체크된 항목은 누구나 볼 수 있고, 체크 해제된 항목은 비밀번호 입력 후 열람 가능합니다.</p>
            <div className="space-y-3">
              {ALL_FIELDS.map((field) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleFields.includes(field)}
                    onChange={() => toggleField(field)}
                    className="w-4 h-4 rounded border-slate-300 accent-slate-900"
                  />
                  <span className="text-sm font-medium text-slate-700">{FIELD_LABELS[field]}</span>
                  {!visibleFields.includes(field) && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">비공개</span>
                  )}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                비공개 열람 비밀번호
              </label>
              <input
                type="text"
                value={sharePassword}
                onChange={(e) => { setSharePassword(e.target.value); setSaved(false); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="비공개 항목 열람 시 사용할 비밀번호"
              />
              <p className="text-xs text-slate-300 mt-1">비어있으면 비공개 항목을 열람할 수 없습니다.</p>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition"
            >
              {loading ? "저장 중..." : saved ? "저장됨 ✓" : "저장"}
            </button>
            <Link href="/dashboard" className="flex-1 text-center bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-semibold">
              {saved ? "완료" : "취소"}
            </Link>
          </div>
        </form>

        {/* 파일 업로드 */}
        {savedId ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <FileUploader businessId={savedId} files={files} onUpdate={setFiles} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 opacity-40 pointer-events-none text-center text-sm text-slate-400">
            기본 정보를 먼저 저장하면 파일을 첨부할 수 있습니다.
          </div>
        )}
      </main>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense>
      <EditForm />
    </Suspense>
  );
}