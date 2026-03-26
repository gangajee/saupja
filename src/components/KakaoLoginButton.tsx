"use client";

import { signIn } from "next-auth/react";

export default function KakaoLoginButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
      className={className}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.896 1 7.445c0 2.234 1.42 4.196 3.573 5.33L3.74 16.07a.23.23 0 00.338.254l4.116-2.73c.267.026.537.04.81.04 4.418 0 8-2.896 8-6.445C17 3.896 13.418 1 9 1z" fill="#191919"/>
      </svg>
      카카오로 시작하기
    </button>
  );
}