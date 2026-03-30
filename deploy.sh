#!/bin/bash
set -e

SERVER="root@172.234.90.35"
APP_DIR="/var/www/saupja"

echo "1) dev → main 머지..."
git checkout main
git merge dev --no-edit
git push origin main

git checkout dev

echo "2) 서버 배포 중..."
ssh $SERVER "cd $APP_DIR && git pull origin main && npm run build && pm2 restart saupja"

echo "배포 완료 → https://gangajee.mycafe24.com"