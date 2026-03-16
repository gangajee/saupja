import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">사업자</span>
          <div className="flex gap-2">
            <Link
              href="/login"
              className="text-sm text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
          사업자 서류,<br />링크 하나로 끝
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-8 max-w-md">
          사업자 등록증, 통장 사본, 계좌번호를 한 곳에 올리고
          URL 하나로 거래처에 바로 공유하세요.
        </p>
        <Link
          href="/signup"
          className="w-full max-w-xs bg-blue-600 text-white py-3.5 rounded-xl text-base font-medium hover:bg-blue-700 transition text-center"
        >
          무료로 시작하기
        </Link>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
          {[
            { icon: "📎", title: "파일 한 곳에", desc: "서류를 한 번만 올려두세요" },
            { icon: "🔗", title: "링크로 공유", desc: "URL 하나로 즉시 전달" },
            { icon: "🔄", title: "항상 최신", desc: "업데이트하면 바로 반영" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border p-4">
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 pb-safe">
        © 2025 saupja.com
      </footer>
    </div>
  );
}
