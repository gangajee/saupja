"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: "2rem", background: "#f9f9f9" }}>
        <h2 style={{ color: "#c00", marginBottom: "1rem" }}>전역 오류 발생</h2>
        <pre style={{ background: "#fff", border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", fontSize: "12px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {error?.message || "(메시지 없음)"}
          {"\n\ndigest: "}{error?.digest}
          {"\n\nstack:\n"}{error?.stack}
        </pre>
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}>
          다시 시도
        </button>
      </body>
    </html>
  );
}
