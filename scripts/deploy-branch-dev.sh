#!/usr/bin/env bash
set -euo pipefail

# Charger le .env
if [ -f .env.deploy ]; then
  set -o allexport
  source .env.deploy
  set +o allexport
else
  echo "❌ .env.deploy manquant"
  exit 1
fi

BRANCH_NAME="${1:-}"

if [ -z "$BRANCH_NAME" ]; then
  echo "Usage: ./deploy-branch.sh <branch-name>"
  exit 1
fi

TARGET="${DEPLOY_BASE_DIR}/${BRANCH_NAME}"

echo "Deploy branch: ${BRANCH_NAME}"

rm -rf dist

VITE_BASE_PATH="/${BRANCH_NAME}/" \
npm run build

echo "Upload vers ${DEPLOY_USER}@${DEPLOY_HOST}:${TARGET}"

ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${TARGET}"

rsync -av --delete dist/ ${DEPLOY_USER}@${DEPLOY_HOST}:${TARGET}/

echo "✅ https://dev.koldata.cartong.org/${BRANCH_NAME}/"