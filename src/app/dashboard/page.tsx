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
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link href="/" className="text-base font-semibold tracking-tight text-slate-900">사업자</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 hidden sm:block">{session?.user?.email}</span>
            <Link href="/api/auth/signout" className="text-xs text-slate-400 hover:text-slate-700 transition">
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">내 사업자 정보</h2>
            <p className="text-xs text-slate-400 mt-0.5">{businesses.length}개 등록됨</p>
          </div>
          <Link
            href="/dashboard/edit"
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
          >
            + 새로 등록
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-24 text-slate-300">
            <p className="text-5xl mb-5">📋</p>
            <p className="font-semibold text-slate-400 mb-1">등록된 사업자 정보가 없습니다.</p>
            <p className="text-sm">새로 등록 버튼을 눌러 시작하세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <Link href={`/dashboard/${b.id}`} className="flex items-center gap-4 p-5 active:bg-slate-50">
                  <BusinessAvatar name={b.companyName} image={b.profileImage} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 truncate">{b.companyName}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {b.ownerName} · {formatBusinessNumber(b.businessNumber)}
                    </p>
                    <p className="text-xs text-slate-300 mt-1.5">파일 {b.files.length}개</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <div className="border-t border-slate-100 flex divide-x divide-slate-100 text-sm">
                  <Link href={`/u/${b.slug}`} target="_blank" className="flex-1 text-center py-3 text-blue-500 font-medium hover:bg-blue-50 transition active:bg-blue-50">
                    공유 링크
                  </Link>
                  <Link href={`/dashboard/edit?id=${b.id}`} className="flex-1 text-center py-3 text-slate-400 hover:bg-slate-50 transition active:bg-slate-50">
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
