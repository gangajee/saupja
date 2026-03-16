import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-slate-100 sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">
          <span className="text-base font-semibold tracking-tight text-slate-900">사업자</span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-slate-500 px-3 py-2 rounded-lg hover:text-slate-900 transition">
              로그인
            </Link>
            <Link href="/signup" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium">
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-5 pt-20 pb-16">
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-6 tracking-wide">
            사업자 정보 공유 서비스
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.15]">
            사업자 서류,<br />링크 하나로 끝
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-sm leading-relaxed">
            사업자 등록증, 통장 사본, 계좌번호를<br />URL 하나로 거래처에 바로 공유하세요.
          </p>
          <Link
            href="/signup"
            className="w-full max-w-xs bg-slate-900 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-700 transition text-center tracking-wide"
          >
            무료로 시작하기 →
          </Link>
          <p className="text-xs text-slate-300 mt-4">신용카드 불필요 · 무료 사용</p>
        </section>

        {/* Features */}
        <section className="max-w-3xl mx-auto px-5 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "📎", title: "한 곳에 모아두기", desc: "서류를 한 번만 올려두면 끝" },
              { icon: "🔗", title: "링크로 즉시 공유", desc: "URL 하나로 누구에게나 전달" },
              { icon: "🔄", title: "항상 최신 상태", desc: "파일 교체 시 링크는 그대로" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-2xl mb-3">{item.icon}</p>
                <p className="font-semibold text-sm text-slate-800 mb-1">{item.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-300">
        © 2025 saupja.com
      </footer>
    </div>
  );
}
