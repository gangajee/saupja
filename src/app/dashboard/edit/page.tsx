"use client";

import { memo, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";
import PostcodeSearch from "@/components/PostcodeSearch";
import BusinessAvatar from "@/components/BusinessAvatar";

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

// ─── Extracted sub-components ─────────────────────────────────────────────────

// Only re-renders when visibleFields or sharePassword changes, not on every form keystroke
const VisibilitySection = memo(function VisibilitySection({
  visibleFields,
  sharePassword,
  onToggleField,
  onPasswordChange,
}: {
  visibleFields: VisibleField[];
  sharePassword: string;
  onToggleField: (field: VisibleField) => void;
  onPasswordChange: (pw: string) => void;
}) {
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value),
    [onPasswordChange]
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">공개 설정</p>
      <p className="text-xs text-slate-400">체크된 항목은 누구나 볼 수 있고, 체크 해제된 항목은 비밀번호 입력 후 열람 가능합니다.</p>
      <div className="space-y-3">
        {ALL_FIELDS.map((field) => (
          <label key={field} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleFields.includes(field)}
              onChange={() => onToggleField(field)}
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
          onChange={handlePasswordChange}
          className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          placeholder="비공개 항목 열람 시 사용할 비밀번호"
        />
        <p className="text-xs text-slate-300 mt-1">비어있으면 비공개 항목을 열람할 수 없습니다.</p>
      </div>
    </div>
  );
});

// Owns its own upload/delete state — isolated from the main form re-render cycle
const ProfileImageSection = memo(function ProfileImageSection({
  savedId,
  companyName,
  initialImage,
}: {
  savedId: string;
  companyName: string;
  initialImage: string | null;
}) {
  const [profileImage, setProfileImage] = useState(initialImage);
  const [uploading, setUploading] = useState(false);

  // Sync when parent fetches existing data
  useEffect(() => {
    setProfileImage(initialImage);
  }, [initialImage]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/business/${savedId}/profile-image`, { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setProfileImage(data.url);
    }
    setUploading(false);
  }, [savedId]);

  const handleDelete = useCallback(async () => {
    await fetch(`/api/business/${savedId}/profile-image`, { method: "DELETE" });
    setProfileImage(null);
  }, [savedId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">대표 이미지</p>
      <p className="text-xs text-slate-400">링크 공유 시 미리보기 카드에 표시됩니다.</p>
      <div className="flex items-center gap-4">
        {profileImage ? (
          <img src={profileImage} alt="대표 이미지" className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
        ) : (
          <BusinessAvatar name={companyName || "?"} size="lg" />
        )}
        <div className="flex flex-col gap-2">
          <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? "업로드 중..." : profileImage ? "이미지 변경" : "이미지 업로드"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          {profileImage && (
            <button type="button" onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 text-left">
              이미지 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Main form ────────────────────────────────────────────────────────────────

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
  const [startDate, setStartDate] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const pendingOcrFileRef = useRef<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ verified: boolean; message: string } | null>(null);
  const [visibleFields, setVisibleFields] = useState<VisibleField[]>([...ALL_FIELDS]);
  const [sharePassword, setSharePassword] = useState("");
  const [initialProfileImage, setInitialProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/business/${id}`)
      .then((r) => r.json())
      .then((found) => {
        if (!found || found.error) return;
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
        setInitialProfileImage(found.profileImage ?? null);
      });
  }, [id]);

  // Stable handlers — use functional updates where possible to avoid stale closures
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
    if (e.target.name === "ownerName") setVerifyResult(null);
  }, []);

  const toggleField = useCallback((field: VisibleField) => {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
    setSaved(false);
  }, []);

  const handlePasswordChange = useCallback((pw: string) => {
    setSharePassword(pw);
    setSaved(false);
  }, []);

  const handlePostcodeSelect = useCallback((code: string, addr: string) => {
    setPostcode(code);
    setBaseAddress(addr);
    setDetailAddress("");
    setSaved(false);
  }, []);

  const handleDetailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDetailAddress(e.target.value);
    setSaved(false);
  }, []);

  const handleFilesUpdate = useCallback((newFiles: BusinessFile[]) => {
    setFiles(newFiles);
  }, []);

  const handleOcr = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/ocr-business", { method: "POST", body: fd });
    setOcrLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "사업자등록증 분석에 실패했습니다.");
      return;
    }
    const data = await res.json();
    setForm((prev) => ({
      ...prev,
      companyName: data.companyName || prev.companyName,
      ownerName: data.ownerName || prev.ownerName,
      businessNumber: data.businessNumber || prev.businessNumber,
    }));
    if (data.startDate) setStartDate(data.startDate);
    if (data.address) {
      setBaseAddress(data.address);
      setPostcode("");
      setDetailAddress("");
    }
    setVerifyResult(null);
    setSaved(false);
    e.target.value = "";
  }, []);

  // Use refs so handleVerify closure always reads fresh values without recreating itself
  const businessNumberRef = useRef(form.businessNumber);
  const ownerNameRef = useRef(form.ownerName);
  const startDateRef = useRef(startDate);
  useEffect(() => { businessNumberRef.current = form.businessNumber; }, [form.businessNumber]);
  useEffect(() => { ownerNameRef.current = form.ownerName; }, [form.ownerName]);
  useEffect(() => { startDateRef.current = startDate; }, [startDate]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    setVerifyResult(null);
    const res = await fetch("/api/verify-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessNumber: businessNumberRef.current,
        ownerName: ownerNameRef.current,
        startDate: startDateRef.current,
      }),
    });
    const data = await res.json();
    setVerifyResult(data);
    setVerifying(false);
  }, []);

  // Refs for submit to avoid stale deps while keeping stable callback reference
  const submitRef = useRef({ form, baseAddress, postcode, detailAddress, savedId, visibleFields, sharePassword });
  useEffect(() => {
    submitRef.current = { form, baseAddress, postcode, detailAddress, savedId, visibleFields, sharePassword };
  });

  const verifyResultRef = useRef(verifyResult);
  useEffect(() => { verifyResultRef.current = verifyResult; }, [verifyResult]);

  const handleSubmit = useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (!verifyResultRef.current?.verified) {
      setError("사업자 인증을 완료해주세요.");
      return;
    }

    setLoading(true);

    const { form, baseAddress, postcode, detailAddress, savedId, visibleFields, sharePassword } = submitRef.current;
    const combined = baseAddress ? `(${postcode}) ${baseAddress} | ${detailAddress}` : form.address;

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
  }, []);

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
          {/* 사업자등록증 OCR */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">자동 입력</p>
            <p className="text-xs text-blue-400 mb-3">사업자등록증을 업로드하면 정보가 자동으로 채워집니다.</p>
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed border-blue-200 text-blue-500 hover:bg-blue-100 transition cursor-pointer ${ocrLoading ? "opacity-50 pointer-events-none" : ""}`}>
              {ocrLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  분석 중...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  사업자등록증 업로드
                </>
              )}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleOcr} disabled={ocrLoading} />
            </label>
          </div>

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

              {/* 사업자번호 + 개업일 + 인증 */}
              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      사업자번호 <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="businessNumber"
                      value={form.businessNumber}
                      onChange={(e) => { onChange(e); setVerifyResult(null); }}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="000-00-00000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      개업일 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setVerifyResult(null); }}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !form.businessNumber || !form.ownerName || !startDate}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
                >
                  {verifying ? "인증 중..." : verifyResult?.verified ? "✓ 인증 완료" : "사업자 인증"}
                </button>
                {verifyResult && (
                  <p className={`text-xs flex items-center gap-1 ${verifyResult.verified ? "text-green-600" : "text-red-500"}`}>
                    {verifyResult.verified ? "✓" : "✗"} {verifyResult.message}
                  </p>
                )}
              </div>

              {/* 주소 */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">사업장 주소</label>
                <div className="flex gap-2">
                  <input value={postcode} readOnly className="w-24 border border-slate-200 rounded-xl px-3 py-3 text-sm bg-slate-50 text-slate-400" placeholder="우편번호" />
                  <PostcodeSearch onSelect={handlePostcodeSelect} />
                </div>
                <input value={baseAddress} readOnly className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-slate-50 text-slate-400" placeholder="기본 주소 (주소 검색 후 자동 입력)" />
                <input value={detailAddress} onChange={handleDetailChange} className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="상세 주소 (동/호수 등)" />
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

          {/* 공개 설정 — memoized, skips re-render on form keystrokes */}
          <VisibilitySection
            visibleFields={visibleFields}
            sharePassword={sharePassword}
            onToggleField={toggleField}
            onPasswordChange={handlePasswordChange}
          />

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

        {/* 대표 이미지 — memoized, owns upload state independently */}
        {savedId && (
          <ProfileImageSection
            savedId={savedId}
            companyName={form.companyName}
            initialImage={initialProfileImage}
          />
        )}

        {/* 파일 업로드 */}
        {savedId ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <FileUploader businessId={savedId} files={files} onUpdate={handleFilesUpdate} />
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