#!/usr/bin/env bash
#
# Apply Supabase migrations to the staging project
# via the Management API. Reads PAT and project ref from ./.env.
#
# Usage (from repo root):
#   bash scripts/apply-supabase-migrations.sh
#
# Required env vars (in ./.env):
#   SUPABASE_ACCESS_TOKEN — Personal access token (https://supabase.com/dashboard/account/tokens)
#   SUPABASE_PROJECT_REF  — Project ref of the target Supabase project
#
# Idempotency: re-running will fail if tables already exist (CREATE TABLE
# does not have IF NOT EXISTS). Inspect SQL output before re-runs.

set -euo pipefail

# 토큰 / 프로젝트 ref 는 다음 위치 중 가장 먼저 발견된 곳에서 로드한다.
# 1) 이미 export 된 환경 변수 (CI 등)
# 2) ./.env (repo root)
# 3) ./web/.env.local (Next.js 앱 .env.local)
set -a
[[ -f .env ]] && source .env
[[ -f web/.env.local ]] && source web/.env.local
set +a

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "FATAL: SUPABASE_ACCESS_TOKEN not set in .env" >&2
  exit 1
fi

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "FATAL: SUPABASE_PROJECT_REF not set in .env" >&2
  exit 1
fi

API="https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query"

apply_sql_file() {
  local file="$1"
  local label="$2"
  echo "→ Applying ${label} (${file})..."

  local payload
  payload=$(python3 -c "import json,sys; print(json.dumps({'query': open(sys.argv[1]).read()}))" "$file")

  local response
  local http_code
  response=$(curl -s -o /tmp/supa-resp.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary "${payload}" \
    "${API}")
  http_code="${response}"

  echo "  HTTP ${http_code}"
  if [[ "${http_code}" != "200" && "${http_code}" != "201" ]]; then
    echo "  FAIL — response body:"
    cat /tmp/supa-resp.json
    echo
    exit 1
  fi
  echo "  OK"
}

MODE="${1:-init}"

case "${MODE}" in
  init)
    apply_sql_file "web/supabase/migrations/001_initial_schema.sql" "001 initial schema"
    apply_sql_file "web/supabase/migrations/002_counseling_programs.sql" "002 counseling programs"

    echo
    echo "→ Verifying tables..."
    curl -s \
      -X POST \
      -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"query":"SELECT tablename FROM pg_tables WHERE schemaname='\''public'\'' ORDER BY tablename;"}' \
      "${API}"
    echo
    echo
    echo "✓ Migrations applied. Next: run scripts/create-supabase-bucket.sh and scripts/write-env-local.sh"
    ;;
  blog)
    # 블로그 마이그레이션 — 003 카테고리 교체 + 004 마음토스 author 시드.
    # 003 은 사용자가 카테고리 매핑을 채운 후에만 안전하게 적용된다.
    # 사전 단계:
    #   cd scripts/migrate-blog && npm run categories
    #   → .data/categories-mapping.json 검토 후 web/supabase/migrations/003_replace_categories.sql 의 INSERT 블록 채우기
    apply_sql_file "web/supabase/migrations/003_replace_categories.sql" "003 replace categories"
    apply_sql_file "web/supabase/migrations/004_seed_mindthos_author.sql" "004 seed mindthos author"
    apply_sql_file "web/supabase/migrations/005_categories_finalize.sql" "005 categories finalize"

    echo
    echo "→ Verifying categories / authors..."
    curl -s \
      -X POST \
      -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"query":"SELECT '\''cat'\'' AS kind, slug, name FROM categories UNION ALL SELECT '\''auth'\'', slug, name FROM authors ORDER BY kind, slug;"}' \
      "${API}"
    echo
    echo
    echo "✓ Blog migrations applied. Next: cd scripts/migrate-blog && npm run transform -- --slug=<test-slug>"
    ;;
  *)
    echo "Usage: bash scripts/apply-supabase-migrations.sh [init|blog]" >&2
    echo "  init (default) — apply 001 + 002 (스키마 부트스트랩)" >&2
    echo "  blog            — apply 003 + 004 (블로그 마이그레이션 준비)" >&2
    exit 1
    ;;
esac
