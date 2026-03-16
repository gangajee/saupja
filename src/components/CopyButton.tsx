"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-2 py-0.5 rounded-md font-medium transition shrink-0 ${
        copied
          ? "bg-green-50 text-green-600"
          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      }`}
    >
      {copied ? "복사됨" : "복사"}
    </button>
  );
}
