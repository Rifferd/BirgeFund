#!/usr/bin/env bash

set -euo pipefail

API_URL="${API_URL:-http://localhost:8000/api}"

echo "BirgeFund smoke test"
echo "API_URL=$API_URL"
echo ""

extract_json_field() {
  python3 -c "import json,sys; print(json.load(sys.stdin)$1)"
}

login() {
  local email="$1"
  local password="$2"

  local response
  local status

  response="$(mktemp)"

  status="$(curl -sS -o "$response" -w "%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")"

  if [ "$status" = "200" ]; then
    cat "$response"
    rm -f "$response"
    return 0
  fi

  echo "ERROR: login failed for $email, status=$status" >&2
  cat "$response" >&2
  echo "" >&2
  rm -f "$response"
  exit 1
}

echo "1) Healthcheck"
curl -fsS "$API_URL/health" >/dev/null
echo "OK: health"

echo "2) Public categories"
curl -fsS "$API_URL/categories" >/dev/null
echo "OK: categories"

echo "3) Public translations"
curl -fsS "$API_URL/translations?language=ru" >/dev/null
echo "OK: translations"

echo "4) Public CMS page"
curl -fsS "$API_URL/cms/pages/test-mode" >/dev/null
echo "OK: cms page"

echo "5) Public banners"
curl -fsS "$API_URL/banners" >/dev/null
echo "OK: banners"

echo "6) Demo project"
PROJECT_JSON="$(curl -fsS "$API_URL/projects/demo-school-library")"
PROJECT_ID="$(printf '%s' "$PROJECT_JSON" | extract_json_field "['id']")"
PROJECT_STATUS="$(printf '%s' "$PROJECT_JSON" | extract_json_field "['status']")"

if [ "$PROJECT_STATUS" != "fundraising" ]; then
  echo "ERROR: demo-school-library status must be fundraising, got: $PROJECT_STATUS"
  exit 1
fi

echo "OK: demo project id=$PROJECT_ID status=$PROJECT_STATUS"

echo "7) Login admin"
ADMIN_LOGIN_JSON="$(login "admin@birgefund.kg" "AdminPass123!")"
ADMIN_TOKEN="$(printf '%s' "$ADMIN_LOGIN_JSON" | extract_json_field "['access_token']")"
echo "OK: admin login"

echo "8) Admin dashboard"
curl -fsS "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN" >/dev/null
echo "OK: admin dashboard"

echo "9) Login backer"
BACKER_LOGIN_JSON="$(login "backer@birgefund.kg" "BackerPass123!")"
BACKER_TOKEN="$(printf '%s' "$BACKER_LOGIN_JSON" | extract_json_field "['access_token']")"
echo "OK: backer login"

echo "10) Create idempotent mock payment"
PAYMENT_JSON="$(curl -fsS -X POST "$API_URL/payments/mock/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BACKER_TOKEN" \
  -d '{
    "project_id": '"$PROJECT_ID"',
    "amount": 5000,
    "currency": "KGS",
    "method": "TEST_CARD",
    "idempotency_key": "smoke-demo-payment-001",
    "request_payload": {
      "comment": "Smoke test payment",
      "anonymous": false
    }
  }')"

PAYMENT_ID="$(printf '%s' "$PAYMENT_JSON" | extract_json_field "['id']")"
PAYMENT_STATUS="$(printf '%s' "$PAYMENT_JSON" | extract_json_field "['status']")"
echo "OK: payment id=$PAYMENT_ID status=$PAYMENT_STATUS"

echo "11) Confirm mock payment"
CONFIRM_JSON="$(curl -fsS -X POST "$API_URL/payments/mock/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BACKER_TOKEN" \
  -d '{
    "payment_attempt_id": '"$PAYMENT_ID"'
  }')"

CONFIRM_STATUS="$(printf '%s' "$CONFIRM_JSON" | extract_json_field "['status']")"

if [ "$CONFIRM_STATUS" != "success" ]; then
  echo "ERROR: payment status must be success, got: $CONFIRM_STATUS"
  exit 1
fi

echo "OK: payment confirmed"

echo "12) Ledger summary"
SUMMARY_JSON="$(curl -fsS "$API_URL/ledger/projects/$PROJECT_ID/summary")"
GROSS_COLLECTED="$(printf '%s' "$SUMMARY_JSON" | extract_json_field "['gross_collected']")"

echo "OK: ledger summary gross_collected=$GROSS_COLLECTED"

echo ""
echo "Smoke test passed."
