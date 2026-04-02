export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatBusinessNumber } from "@/lib/utils";
import DeleteBusinessButton from "@/components/DeleteBusinessButton";
import BusinessAvatar from "@/components/BusinessAvatar";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const businesses = await prisma.business.findMany({
    where: { userId },
    include: { files: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-14 flex justify-between items-center">
          <Link href="/" className="text-sm font-bold text-zinc-900 tracking-tight">
            사업자도큐
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 hidden sm:block">{session?.user?.email}</span>
            <Link href="/api/auth/signout" className="text-xs text-zinc-400 hover:text-zinc-700 transition">
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10">
        <div className="flex justify-between items-end mb-7">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">대시보드</p>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">내 사업자 정보</h2>
            <p className="text-xs text-zinc-400 mt-1">{businesses.length}개 등록됨</p>
          </div>
          <Link
            href="/dashboard/edit"
            className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            새로 등록
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-100 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-zinc-700 mb-1 text-sm">등록된 사업자 정보가 없습니다</p>
            <p className="text-xs text-zinc-400 mb-6">새로 등록 버튼을 눌러 시작하세요.</p>
            <Link href="/dashboard/edit" className="inline-flex items-center gap-1.5 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 transition">
              지금 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {businesses.map((b) => (
              <div key={b.id} className="bg-white border border-zinc-100 hover:border-zinc-200 rounded-2xl overflow-hidden transition-all hover:shadow-sm">
                <Link href={`/dashboard/${b.id}`} className="flex items-center gap-4 px-5 py-4">
                  <BusinessAvatar name={b.companyName} image={b.profileImage} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-zinc-900 truncate text-sm">{b.companyName}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {b.ownerName} · {formatBusinessNumber(b.businessNumber)}
                    </p>
                    <p className="text-xs text-zinc-300 mt-1">서류 {b.files.length}개</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <div className="border-t border-zinc-100 flex divide-x divide-zinc-100">
                  <Link
                    href={`/u/${b.slug}`}
                    target="_blank"
                    className="flex-1 text-center py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition text-xs font-medium"
                  >
                    공유 링크
                  </Link>
                  <Link
                    href={`/dashboard/edit?id=${b.id}`}
                    className="flex-1 text-center py-2.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition text-xs"
                  >
                    수정
                  </Link>
                  <DeleteBusinessButton id={b.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
