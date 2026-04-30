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

if [[ ! -f .env ]]; then
  echo "FATAL: .env not found in $(pwd) — run from repo root" >&2
  exit 1
fi

set -a; source .env; set +a

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
