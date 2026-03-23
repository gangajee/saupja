#!/bin/bash
set -e

echo "dev → main 배포 시작..."

git checkout main
git merge dev --no-edit
git push origin main

git checkout dev

echo "배포 완료. Vercel이 자동으로 빌드합니다."