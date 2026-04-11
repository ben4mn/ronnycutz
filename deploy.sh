#!/bin/bash
# Auto-deploy: pulls latest main and rebuilds the container if there are new commits.
# Runs from cron on the server every minute. Safe to run manually too.
set -e

cd "$(dirname "$0")"

git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploying ${LOCAL:0:7} -> ${REMOTE:0:7}"
git reset --hard origin/main
docker compose up -d --build
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy complete"
