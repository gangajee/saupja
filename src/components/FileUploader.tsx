"use client";

import { useState, useRef } from "react";
import { formatFileSize } from "@/lib/utils";

type BusinessFile = {
  id: string;
  type: string;
  label: string;
  url: string;
  fileName: string;
  fileSize: number;
};

type Props = {
  businessId: string;
  files: BusinessFile[];
  onUpdate: (files: BusinessFile[]) => void;
};

const FILE_TYPES = [
  { value: "registration", label: "사업자 등록증" },
  { value: "bankbook", label: "통장 사본" },
  { value: "other", label: "기타 서류" },
];

export default function FileUploader({ businessId, files, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("registration");
  const [customLabel, setCustomLabel] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const label =
      selectedType === "other"
        ? customLabel || "기타 서류"
        : FILE_TYPES.find((t) => t.value === selectedType)?.label ?? selectedType;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", selectedType);
    formData.append("label", label);

    const res = await fetch(`/api/business/${businessId}/files`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "업로드에 실패했습니다.");
      return;
    }

    const newFile = await res.json();
    onUpdate([...files, newFile]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(fileId: string) {
    if (!confirm("파일을 삭제할까요?")) return;
    const res = await fetch(`/api/business/${businessId}/files/${fileId}`, {
      method: "DELETE",
    });
    if (res.ok) onUpdate(files.filter((f) => f.id !== fileId));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">첨부 서류</h3>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.label}</p>
                <p className="text-xs text-gray-400 truncate">
                  {file.fileName} · {formatFileSize(file.fileSize)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file.id)}
                className="text-red-400 text-sm shrink-0 px-2 py-1"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {FILE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {selectedType === "other" && (
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="서류 이름 입력"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-blue-300 bg-blue-50 text-blue-600 text-sm font-medium cursor-pointer active:bg-blue-100 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {uploading ? (
            "업로드 중..."
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              파일 선택 (PDF, JPG, PNG · 최대 10MB)
            </>
          )}
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
