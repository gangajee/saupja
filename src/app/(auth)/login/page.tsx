"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-5 border-b border-zinc-100 bg-white">
        <Link href="/" className="text-sm font-bold text-zinc-900 hover:text-zinc-600 transition tracking-tight">
          사업자도큐
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-zinc-900 mb-1.5 tracking-tight">시작하기</h1>
              <p className="text-sm text-zinc-500">카카오 계정으로 간편하게 로그인하세요.</p>
            </div>

            <button
              type="button"
              onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] text-zinc-900 py-3 rounded-xl text-sm font-bold hover:bg-[#F5DC00] transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.896 1 7.445c0 2.234 1.42 4.196 3.573 5.33L3.74 16.07a.23.23 0 00.338.254l4.116-2.73c.267.026.537.04.81.04 4.418 0 8-2.896 8-6.445C17 3.896 13.418 1 9 1z" fill="#191919"/>
              </svg>
              카카오로 계속하기
            </button>

            <p className="text-center text-xs text-zinc-400 mt-5">
              로그인 시 서비스 이용약관에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
