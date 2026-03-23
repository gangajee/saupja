"use client";

import { useRouter } from "next/navigation";

export default function DeleteBusinessButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까? 모든 파일도 함께 삭제됩니다.")) return;

    const res = await fetch(`/api/business/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("삭제에 실패했습니다.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="flex-1 text-center py-3 text-red-400 hover:bg-red-50 transition active:bg-red-50"
    >
      삭제
    </button>
  );
}