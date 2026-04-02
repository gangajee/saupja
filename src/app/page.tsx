import KakaoLoginButton from "@/components/KakaoLoginButton";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-white tracking-tight">사업자도큐</span>
          <KakaoLoginButton className="flex items-center gap-2 bg-[#FEE500] text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#F5DC00] transition" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(120,119,198,0.15),transparent)]" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 border border-white/10 bg-white/5 px-3.5 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                무료 · 카드 불필요
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
                사업자 서류,
                <br />
                <span className="text-zinc-500">링크 하나로 끝</span>
              </h1>

              <p className="text-base text-zinc-400 leading-relaxed mb-10 max-w-sm mx-auto">
                사업자등록증·통장사본·계좌번호를
                <br />
                URL 하나로 거래처에 바로 공유하세요.
              </p>

              <div className="flex flex-col items-center gap-3">
                <KakaoLoginButton className="inline-flex items-center gap-2.5 bg-[#FEE500] text-zinc-900 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#F5DC00] transition shadow-lg shadow-yellow-500/10" />
                <p className="text-xs text-zinc-600">회원가입 없이 카카오로 즉시 시작</p>
              </div>
            </div>

            {/* Product mockup */}
            <div className="mt-16 max-w-xs mx-auto">
              <div className="bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">saupja.biz</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-700 bg-zinc-800 px-2 py-0.5 rounded-md">QR</span>
                    <span className="text-[10px] text-zinc-700 bg-zinc-800 px-2 py-0.5 rounded-md">링크 복사</span>
                  </div>
                </div>
                <div className="px-5 pt-5 pb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 font-bold text-indigo-300 text-base border border-indigo-500/20">
                    홍
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-widest mb-0.5">사업자 정보</p>
                    <p className="text-base font-bold text-white">홍길동 전기</p>
                    <p className="text-xs text-zinc-500">홍길동 대표</p>
                  </div>
                </div>
                <div className="mx-4 mb-3 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden bg-zinc-800/40">
                  {[
                    { label: "사업자번호", value: "123-45-67890" },
                    { label: "계좌번호", value: "국민 123-456-7890" },
                    { label: "전화번호", value: "02-1234-5678" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-[10px] text-zinc-600 w-16 shrink-0">{row.label}</span>
                      <span className="text-xs font-semibold text-zinc-300">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mx-4 mb-4">
                  <div className="bg-white rounded-xl py-3 text-center">
                    <span className="text-xs font-bold text-zinc-900">전체 서류 다운로드</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-white border-t border-zinc-100">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest text-center mb-12">3단계로 끝나는 설정</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden">
              {[
                { step: "01", title: "정보 등록", desc: "사업자 정보와 서류를 한 번만 등록합니다." },
                { step: "02", title: "링크 생성", desc: "고유 URL이 자동으로 만들어집니다." },
                { step: "03", title: "공유하기", desc: "링크 하나로 거래처에 즉시 전달합니다." },
              ].map((item) => (
                <div key={item.step} className="bg-white p-8">
                  <p className="text-xs font-bold text-zinc-300 mb-5 tracking-widest">{item.step}</p>
                  <h3 className="text-base font-bold text-zinc-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-zinc-950 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest text-center mb-12">주요 기능</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: "링크 하나로 공유",
                  desc: "고유 URL 하나로 어디서든 사업자 정보에 바로 접근할 수 있습니다.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                },
                {
                  title: "서류 한 곳에",
                  desc: "사업자등록증, 통장사본 등 서류를 한 번만 올려두면 끝입니다.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
                {
                  title: "원클릭 복사",
                  desc: "사업자번호, 계좌번호를 버튼 하나로 클립보드에 복사합니다.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  title: "항상 최신 서류",
                  desc: "파일을 교체해도 링크는 그대로 — 상대방은 항상 최신 서류를 받습니다.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="border border-white/5 bg-white/3 hover:bg-white/5 rounded-2xl p-6 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border-t border-zinc-100">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-zinc-500 text-sm mb-8">무료로 사업자 정보 페이지를 만들어보세요.</p>
            <KakaoLoginButton className="inline-flex items-center gap-2.5 bg-[#FEE500] text-zinc-900 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#F5DC00] transition shadow-lg shadow-yellow-200" />
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
          <span className="font-bold text-zinc-500">사업자도큐</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-zinc-400 transition">로그인</Link>
            <span>© 2025 saupja.biz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
