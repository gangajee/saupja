import KakaoLoginButton from "@/components/KakaoLoginButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <span className="font-bold text-slate-900 tracking-tight text-lg">사업자</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-slate-50/80 to-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-16">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-7">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
                사업자 정보 공유 서비스
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-5">
                사업자 서류,<br />
                <span className="text-slate-300">링크 하나로 끝</span>
              </h1>
              <p className="text-base text-slate-400 max-w-xs mx-auto leading-relaxed mb-10">
                등록증·통장사본·계좌번호를<br />URL 하나로 거래처에 바로 공유
              </p>
              <KakaoLoginButton className="inline-flex items-center gap-2.5 bg-[#FEE500] text-[#191919] px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#F5DC00] transition shadow-sm shadow-yellow-200" />
              <p className="text-xs text-slate-300 mt-3">무료 · 카드 불필요</p>
            </div>

            {/* Product mockup */}
            <div className="max-w-xs mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">saupja.com</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-300">QR</span>
                    <span className="text-[10px] text-slate-300">링크 복사</span>
                  </div>
                </div>
                <div className="px-5 pt-5 pb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 text-base">
                    홍
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-300 font-semibold uppercase tracking-widest mb-0.5">사업자 정보</p>
                    <p className="text-base font-bold text-slate-900">홍길동 전기</p>
                    <p className="text-xs text-slate-400">홍길동 대표</p>
                  </div>
                </div>
                <div className="mx-4 mb-3 border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden">
                  {[
                    { label: "사업자번호", value: "123-45-67890" },
                    { label: "계좌번호", value: "국민 123456-78-9012" },
                    { label: "전화번호", value: "02-1234-5678" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-[10px] text-slate-400 w-16 shrink-0">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-700">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mx-4 mb-4">
                  <div className="bg-slate-900 rounded-xl py-3 text-center">
                    <span className="text-xs font-semibold text-white">전체 서류 다운로드</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-950">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest text-center mb-12">사용 방법</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "정보 등록", desc: "사업자 정보와 서류를 한 번만 업로드" },
                { step: "2", title: "링크 생성", desc: "고유 URL이 자동으로 생성됨" },
                { step: "3", title: "공유하기", desc: "링크 하나로 거래처에 바로 전달" },
              ].map((item) => (
                <div key={item.step} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                    <span className="text-xs font-bold text-slate-500">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-12">주요 기능</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "링크 하나로 공유", desc: "saupja.com/u/홍길동전기 형태의 고유 URL로 누구에게든 바로 전달", emoji: "🔗" },
              { title: "파일 한 곳에", desc: "사업자 등록증, 통장 사본 등 서류를 한 번만 올려두면 끝", emoji: "📂" },
              { title: "원클릭 복사", desc: "사업자번호, 계좌번호를 버튼 한 번으로 클립보드에 복사", emoji: "⚡" },
              { title: "항상 최신 상태", desc: "파일을 교체해도 링크는 그대로 — 상대방은 항상 최신 서류 확인", emoji: "✅" },
            ].map((item) => (
              <div key={item.title} className="border border-slate-100 hover:border-slate-200 rounded-2xl p-6 transition-all hover:shadow-sm">
                <span className="text-2xl mb-4 block">{item.emoji}</span>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-slate-900 rounded-3xl px-8 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">지금 바로 시작하세요</h2>
            <p className="text-slate-500 text-sm mb-8">무료로 사업자 정보 페이지를 만들어보세요.</p>
            <KakaoLoginButton className="inline-flex items-center gap-2.5 bg-[#FEE500] text-[#191919] px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#F5DC00] transition" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <span className="font-bold text-slate-400">사업자</span>
          <span>© 2025 saupja.com · All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
