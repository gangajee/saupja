"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-slate-100 px-5 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-slate-900">사업자</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">로그인</h1>
          <p className="text-sm text-slate-400 mb-8">카카오 계정으로 간편하게 시작하세요.</p>

          <button
            type="button"
            onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-2.5 bg-[#FEE500] text-[#191919] py-3 rounded-xl text-sm font-semibold hover:bg-[#F5DC00] transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.896 1 7.445c0 2.234 1.42 4.196 3.573 5.33L3.74 16.07a.23.23 0 00.338.254l4.116-2.73c.267.026.537.04.81.04 4.418 0 8-2.896 8-6.445C17 3.896 13.418 1 9 1z" fill="#191919"/>
            </svg>
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}