#!/usr/bin/env sh
# Local API on :8787 with the values from .env
cd "$(dirname "$0")" && set -a && . ./.env && set +a && exec python -m uvicorn app:create_app --factory --port 8787 --reload
