"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 max-w-lg w-full space-y-3">
        <p className="text-sm font-semibold text-red-600">대시보드 오류</p>
        <pre className="text-xs text-zinc-600 bg-zinc-50 rounded-xl p-3 overflow-auto whitespace-pre-wrap">
          {error.message}
          {"\n\n"}digest: {error.digest}
        </pre>
        <button
          onClick={reset}
          className="text-xs text-zinc-500 hover:text-zinc-900 underline"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
