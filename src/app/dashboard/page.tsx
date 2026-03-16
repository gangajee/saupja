import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatBusinessNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const businesses = await prisma.business.findMany({
    where: { userId: session.user.id },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-blue-600">사업자</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">내 사업자 정보</h2>
          <Link
            href="/dashboard/edit"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            + 새로 등록
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p className="font-medium mb-1">등록된 사업자 정보가 없습니다.</p>
            <p className="text-sm">새로 등록 버튼을 눌러 시작하세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border overflow-hidden">
                <Link href={`/dashboard/${b.id}`} className="block p-4 active:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">{b.companyName}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {b.ownerName} · {formatBusinessNumber(b.businessNumber)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">파일 {b.files.length}개</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <div className="border-t flex divide-x text-sm">
                  <Link
                    href={`/u/${b.slug}`}
                    target="_blank"
                    className="flex-1 text-center py-3 text-blue-600 font-medium active:bg-gray-50"
                  >
                    공유 링크
                  </Link>
                  <Link
                    href={`/dashboard/edit?id=${b.id}`}
                    className="flex-1 text-center py-3 text-gray-600 active:bg-gray-50"
                  >
                    수정
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
