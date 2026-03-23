import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "kakao") {
        const kakaoId = account.providerAccountId;

        // 카카오 ID로 Account 레코드 확인
        const existing = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: "kakao", providerAccountId: kakaoId } },
        });

        if (!existing) {
          // 새 유저 생성
          const newUser = await prisma.user.create({
            data: { name: user.name ?? "카카오 사용자" },
          });

          await prisma.account.create({
            data: {
              userId: newUser.id,
              type: "oauth",
              provider: "kakao",
              providerAccountId: kakaoId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
            },
          });

          user.id = newUser.id;
        } else {
          user.id = existing.userId;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.id) token.id = user.id;

      // 카카오 로그인 시 Account에서 userId 조회
      if (account?.provider === "kakao") {
        const acc = await prisma.account.findUnique({
          where: { provider_providerAccountId: { provider: "kakao", providerAccountId: account.providerAccountId } },
        });
        if (acc) token.id = acc.userId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}
