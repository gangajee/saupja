"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FileUploader from "@/components/FileUploader";

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

function EditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState<FormData>(INITIAL);
  const [files, setFiles] = useState<BusinessFile[]>([]);
  const [savedId, setSavedId] = useState<string | null>(id);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!id);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/business`)
      .then((r) => r.json())
      .then((list) => {
        const found = list.find((b: { id: string }) => b.id === id);
        if (found) {
          setForm(found);
          setFiles(found.files ?? []);
        }
      });
  }, [id]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(savedId ? `/api/business/${savedId}` : "/api/business", {
      method: savedId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    <div className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 p-1 -ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold">{id ? "정보 수정" : "사업자 정보 등록"}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-10 space-y-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "companyName", label: "상호명", placeholder: "홍길동전기", required: true },
              { name: "ownerName", label: "대표자명", placeholder: "홍길동", required: true },
              { name: "businessNumber", label: "사업자번호", placeholder: "000-00-00000", required: true },
              { name: "phone", label: "전화번호", placeholder: "02-0000-0000" },
            ].map(({ name, label, placeholder, required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  name={name}
                  value={form[name as keyof FormData]}
                  onChange={onChange}
                  required={required}
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">사업장 주소</label>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="서울시 강남구..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">은행명</label>
              <input
                name="bankName"
                value={form.bankName}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="국민은행"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">계좌번호</label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000-0000-0000-00"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-base font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "저장 중..." : saved ? "저장됨 ✓" : "저장"}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-xl text-base font-medium"
            >
              {saved ? "완료" : "취소"}
            </Link>
          </div>
        </form>

        {savedId ? (
          <div className="bg-white rounded-2xl border p-5">
            <FileUploader businessId={savedId} files={files} onUpdate={setFiles} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-5 opacity-50 pointer-events-none text-center text-sm text-gray-400">
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
