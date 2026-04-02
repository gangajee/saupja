"use client";

import { memo, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PostcodeSearch from "@/components/PostcodeSearch";
import BusinessAvatar from "@/components/BusinessAvatar";
import { formatFileSize } from "@/lib/utils";

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
  website: string;
};

const INITIAL: FormData = {
  companyName: "",
  ownerName: "",
  businessNumber: "",
  address: "",
  phone: "",
  bankName: "",
  accountNumber: "",
  website: "",
};

const FILE_TYPES = [
  { value: "registration", label: "사업자 등록증" },
  { value: "bankbook", label: "통장 사본" },
  { value: "other", label: "기타 서류" },
] as const;

type PendingFile = { file: File; type: string; label: string };

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
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">공개 설정</p>
      <p className="text-xs text-zinc-500">체크된 항목은 누구나 볼 수 있고, 체크 해제된 항목은 비밀번호 입력 후 열람 가능합니다.</p>
      <div className="space-y-3">
        {ALL_FIELDS.map((field) => (
          <label key={field} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleFields.includes(field)}
              onChange={() => onToggleField(field)}
              className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-700">{FIELD_LABELS[field]}</span>
            {!visibleFields.includes(field) && (
              <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full">비공개</span>
            )}
          </label>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">
          비공개 열람 비밀번호
        </label>
        <input
          type="text"
          value={sharePassword}
          onChange={handlePasswordChange}
          className="w-full border border-zinc-200 bg-white text-zinc-900 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400"
          placeholder="비공개 항목 열람 시 사용할 비밀번호"
        />
        <p className="text-xs text-zinc-400 mt-1">비어있으면 비공개 항목을 열람할 수 없습니다.</p>
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
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">대표 이미지</p>
      <p className="text-xs text-zinc-500">링크 공유 시 미리보기 카드에 표시됩니다.</p>
      <div className="flex items-center gap-4">
        {profileImage ? (
          <img src={profileImage} alt="대표 이미지" className="w-20 h-20 rounded-xl object-cover border border-zinc-100" />
        ) : (
          <BusinessAvatar name={companyName || "?"} size="lg" />
        )}
        <div className="flex flex-col gap-2">
          <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? "업로드 중..." : profileImage ? "이미지 변경" : "이미지 업로드"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          {profileImage && (
            <button type="button" onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 text-left transition">
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
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingFileType, setPendingFileType] = useState<string>("registration");
  const [pendingFileLabel, setPendingFileLabel] = useState("");
  const pendingFilesRef = useRef<PendingFile[]>([]);
  const pendingFileInputRef = useRef<HTMLInputElement>(null);
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
        setForm({
          companyName: found.companyName ?? "",
          ownerName: found.ownerName ?? "",
          businessNumber: found.businessNumber ?? "",
          address: found.address ?? "",
          phone: found.phone ?? "",
          bankName: found.bankName ?? "",
          accountNumber: found.accountNumber ?? "",
          website: found.website ?? "",
        });
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
    // OCR 파일을 첨부 대기 목록에 자동 추가 (사업자 등록증)
    setPendingFiles((prev) => [
      ...prev.filter((p) => p.type !== "registration"),
      { file, type: "registration", label: "사업자 등록증" },
    ]);
    e.target.value = "";
  }, []);

  // Sync pendingFiles ref
  useEffect(() => { pendingFilesRef.current = pendingFiles; }, [pendingFiles]);

  const handleAddPendingFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const label =
      pendingFileType === "other"
        ? pendingFileLabel || "기타 서류"
        : FILE_TYPES.find((t) => t.value === pendingFileType)?.label ?? pendingFileType;
    setPendingFiles((prev) => [...prev, { file, type: pendingFileType, label }]);
    if (pendingFileInputRef.current) pendingFileInputRef.current.value = "";
  }, [pendingFileType, pendingFileLabel]);

  const removePendingFile = useCallback((idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handlePendingTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingFileType(e.target.value);
  }, []);

  const handlePendingLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingFileLabel(e.target.value);
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
      try {
        const data = await res.json();
        setError(data.error ?? "저장에 실패했습니다.");
      } catch {
        setError("저장에 실패했습니다.");
      }
      return;
    }

    const data = await res.json();
    const bizId: string = data.id ?? submitRef.current.savedId ?? "";
    setSavedId(bizId);
    setSaved(true);

    // 대기 중인 파일들 일괄 업로드
    const toUpload = pendingFilesRef.current;
    if (toUpload.length > 0 && bizId) {
      for (const pf of toUpload) {
        const fd = new FormData();
        fd.append("file", pf.file);
        fd.append("type", pf.type);
        fd.append("label", pf.label);
        const fileRes = await fetch(`/api/business/${bizId}/files`, { method: "POST", body: fd });
        if (fileRes.ok) {
          const newFile = await fileRes.json();
          setFiles((prev) => [...prev, newFile]);
        }
      }
      setPendingFiles([]);
    }
  }, []);

  const inputCls = "w-full border border-zinc-200 bg-white text-zinc-900 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400";
  const labelCls = "block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-700 transition p-1 -ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-zinc-900 text-sm">{id ? "정보 수정" : "사업자 정보 등록"}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-5 pb-12 space-y-3">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-3">
          {/* 사업자등록증 OCR */}
          <div className="border border-blue-100 bg-blue-50 rounded-2xl p-5">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">자동 입력</p>
            <p className="text-xs text-blue-400 mb-3">사업자등록증을 업로드하면 정보가 자동으로 채워집니다.</p>
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border border-dashed border-blue-200 text-blue-500 hover:bg-blue-100 transition cursor-pointer ${ocrLoading ? "opacity-50 pointer-events-none" : ""}`}>
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
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">기본 정보</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "companyName", label: "상호명", placeholder: "홍길동전기", required: true },
                { name: "ownerName", label: "대표자명", placeholder: "홍길동", required: true },
                { name: "phone", label: "전화번호", placeholder: "02-0000-0000" },
              ].map(({ name, label, placeholder, required }) => (
                <div key={name}>
                  <label className={labelCls}>{label} {required && <span className="text-red-400">*</span>}</label>
                  <input name={name} value={form[name as keyof FormData]} onChange={onChange} required={required} className={inputCls} placeholder={placeholder} />
                </div>
              ))}

              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>사업자번호 <span className="text-red-400">*</span></label>
                    <input name="businessNumber" value={form.businessNumber} onChange={(e) => { onChange(e); setVerifyResult(null); }} required className={inputCls} placeholder="000-00-00000" />
                  </div>
                  <div>
                    <label className={labelCls}>개업일 <span className="text-red-400">*</span></label>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setVerifyResult(null); }} required className={inputCls} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !form.businessNumber || !form.ownerName || !startDate}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-40 transition"
                >
                  {verifying ? "인증 중..." : verifyResult?.verified ? "✓ 인증 완료" : "사업자 인증"}
                </button>
                {verifyResult && (
                  <p className={`text-xs flex items-center gap-1 ${verifyResult.verified ? "text-emerald-600" : "text-red-500"}`}>
                    {verifyResult.verified ? "✓" : "✗"} {verifyResult.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className={labelCls}>사업장 주소</label>
                <div className="flex gap-2">
                  <input value={postcode} readOnly className="w-24 border border-zinc-200 rounded-xl px-3 py-3 text-sm bg-zinc-50 text-zinc-400" placeholder="우편번호" />
                  <PostcodeSearch onSelect={handlePostcodeSelect} />
                </div>
                <input value={baseAddress} readOnly className="w-full border border-zinc-200 rounded-xl px-3 py-3 text-sm bg-zinc-50 text-zinc-400" placeholder="기본 주소 (주소 검색 후 자동 입력)" />
                <input value={detailAddress} onChange={handleDetailChange} className={inputCls} placeholder="상세 주소 (동/호수 등)" />
              </div>

              <div>
                <label className={labelCls}>은행명</label>
                <input name="bankName" value={form.bankName} onChange={onChange} className={inputCls} placeholder="국민은행" />
              </div>
              <div>
                <label className={labelCls}>계좌번호</label>
                <input name="accountNumber" value={form.accountNumber} onChange={onChange} className={inputCls} placeholder="000-0000-0000-00" />
              </div>
              <div>
                <label className={labelCls}>홈페이지</label>
                <input name="website" value={form.website} onChange={onChange} className={inputCls} placeholder="https://example.com" />
              </div>
            </div>
          </div>

          <VisibilitySection
            visibleFields={visibleFields}
            sharePassword={sharePassword}
            onToggleField={toggleField}
            onPasswordChange={handlePasswordChange}
          />
        </form>

        {/* 대표 이미지 */}
        {savedId ? (
          <ProfileImageSection savedId={savedId} companyName={form.companyName} initialImage={initialProfileImage} />
        ) : (
          <div className="bg-white border border-zinc-100 rounded-2xl p-5 opacity-40 pointer-events-none">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">대표 이미지</p>
            <p className="text-xs text-zinc-400">저장 후 이미지 업로드 가능합니다.</p>
          </div>
        )}

        {/* 파일 업로드 */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">첨부 서류</p>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-xl gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-700 truncate">{file.label}</p>
                    <p className="text-xs text-zinc-400 truncate">{file.fileName} · {formatFileSize(file.fileSize)}</p>
                  </div>
                  {savedId && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("파일을 삭제할까요?")) return;
                        const res = await fetch(`/api/business/${savedId}/files/${file.id}`, { method: "DELETE" });
                        if (res.ok) setFiles((prev) => prev.filter((f) => f.id !== file.id));
                      }}
                      className="text-red-400 text-xs shrink-0 px-2 hover:text-red-600 transition"
                    >삭제</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-blue-500 font-medium">저장 시 자동 업로드 ({pendingFiles.length}개)</p>
              {pendingFiles.map((pf, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-700 truncate">{pf.label}</p>
                    <p className="text-xs text-zinc-400 truncate">{pf.file.name} · {formatFileSize(pf.file.size)}</p>
                  </div>
                  <button type="button" onClick={() => removePendingFile(i)} className="text-red-400 text-xs shrink-0 px-2">삭제</button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <select
              value={pendingFileType}
              onChange={handlePendingTypeChange}
              className="w-full border border-zinc-200 bg-white text-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {FILE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {pendingFileType === "other" && (
              <input value={pendingFileLabel} onChange={handlePendingLabelChange} placeholder="서류 이름 입력" className={inputCls} />
            )}
            <input ref={pendingFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" className="hidden" id="pending-file-input" onChange={handleAddPendingFile} />
            <label
              htmlFor="pending-file-input"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-zinc-300 text-zinc-400 text-sm font-medium cursor-pointer hover:bg-zinc-50 hover:text-zinc-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              파일 추가 (PDF, JPG, PNG)
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm px-1">{error}</p>}
        <div className="flex gap-2 pb-4">
          <button
            type="submit"
            form="edit-form"
            disabled={loading}
            className="flex-1 bg-zinc-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 disabled:opacity-40 transition"
          >
            {loading ? "저장 중..." : saved ? "저장됨 ✓" : pendingFiles.length > 0 ? `저장 (파일 ${pendingFiles.length}개 포함)` : "저장"}
          </button>
          <Link href="/dashboard" className="flex-1 text-center bg-zinc-100 text-zinc-600 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition">
            {saved ? "완료" : "취소"}
          </Link>
        </div>
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