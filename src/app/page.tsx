import Link from "next/link";

const FEATURES = [
  {
    title: "링크 하나로 공유",
    desc: "saupja.com/u/홍길동전기 형태의 고유 URL로 누구에게든 바로 전달",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    title: "파일 한 곳에",
    desc: "사업자 등록증, 통장 사본 등 서류를 한 번만 올려두면 끝",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "원클릭 복사",
    desc: "사업자번호, 계좌번호를 버튼 한 번으로 클립보드에 복사",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "항상 최신 상태",
    desc: "파일을 교체해도 링크는 그대로 — 상대방은 항상 최신 서류 확인",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-900 tracking-tight">사업자</span>
          <div className="flex items-center gap-1">
            <Link href="/login" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition rounded-lg">
              로그인
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition">
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <p className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-8 tracking-widest uppercase">
            사업자 정보 공유
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            사업자 서류,<br />링크 하나로 끝
          </h1>
          <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed mb-12">
            사업자 등록증, 통장 사본, 계좌번호를<br />URL 하나로 거래처에 바로 공유하세요.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl text-base font-semibold hover:bg-slate-700 transition"
          >
            무료로 시작하기
          </Link>
          <p className="text-xs text-slate-300 mt-4">신용카드 불필요 · 완전 무료</p>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-12">사용 방법</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { step: "01", title: "정보 등록", desc: "사업자 정보와 서류를 한 번만 업로드하세요." },
                { step: "02", title: "링크 생성", desc: "나만의 고유 URL이 자동으로 생성됩니다." },
                { step: "03", title: "공유하기", desc: "링크를 카톡이나 이메일로 거래처에 전달하세요." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-start">
                  <span className="text-4xl font-bold text-slate-100 mb-4">{item.step}</span>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-12">주요 기능</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((item) => (
              <div key={item.title} className="border border-slate-100 rounded-2xl p-6 hover:border-slate-200 transition">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-100 bg-slate-900">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
            <p className="text-slate-400 mb-8">무료로 사업자 정보 페이지를 만들어보세요.</p>
            <Link
              href="/signup"
              className="inline-block bg-white text-slate-900 px-10 py-4 rounded-xl text-base font-semibold hover:bg-slate-100 transition"
            >
              무료로 시작하기
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">사업자</span>
          <span>© 2025 saupja.com · All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}