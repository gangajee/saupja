# 사업자도큐 (saupja.com)

사업자 정보와 서류를 관리하고 링크 하나로 공유하는 서비스입니다.

## 주요 기능

- 사업자 정보 등록 및 관리 (상호명, 사업자번호, 계좌 등)
- 서류 파일 업로드 (사업자등록증, 통장사본 등)
- 고유 공개 링크 생성 (`/u/[slug]`)
- 공개 필드 선택 및 비밀번호 보호
- 파일 개별 / 전체(ZIP) 다운로드
- 이메일/비밀번호 및 카카오 로그인

## 기술 스택

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL (TiDB Serverless) + Prisma
- **Auth**: NextAuth.js (Credentials + Kakao OAuth)
- **Storage**: Cloudflare R2 (미설정 시 base64 fallback)
- **Deploy**: Vercel

## 로컬 개발

```bash
npm install
npx prisma db push
npm run dev
```

`http://localhost:3000` 에서 확인

## 환경변수

`.env` 파일 생성 후 아래 값 입력:

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NTS_API_KEY=

# Cloudflare R2 (선택사항)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## 배포

```bash
./deploy.sh
```

dev → main 머지 후 Vercel 자동 배포

## 브랜치 전략

- `dev`: 개발 및 로컬 테스트
- `main`: 프로덕션 배포 (`saupja.vercel.app`)
