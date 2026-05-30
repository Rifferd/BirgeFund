#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:8000/api}"

echo "BirgeFund API roles smoke"
echo "API_URL=$API_URL"
echo

json_field() {
  python3 -c "import sys,json; print(json.load(sys.stdin)$1)"
}

login() {
  local email="$1"
  local password="$2"

  curl -sS -f -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}"
}

get_token() {
  python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])'
}

check_health() {
  curl -sS -f "$API_URL/health" >/dev/null
  echo "OK: health"
}

check_me_role() {
  local email="$1"
  local password="$2"
  local expected_role="$3"

  local token
  token="$(login "$email" "$password" | get_token)"

  local me
  me="$(curl -sS -f "$API_URL/auth/me" -H "Authorization: Bearer $token")"

  echo "$me" | python3 - "$expected_role" <<'PY'
import json
import sys

expected = sys.argv[1]
data = json.load(sys.stdin)
roles = set(data.get("role_names") or [])
roles.update(role.get("name") for role in data.get("roles") or [] if isinstance(role, dict))

if expected not in roles:
    print(f"ERROR: expected role {expected}, got {sorted(roles)}")
    sys.exit(1)
PY

  echo "OK: $email has role $expected"
}

check_admin_access() {
  local email="$1"
  local password="$2"
  local expected_status="$3"

  local token
  token="$(login "$email" "$password" | get_token)"

  local status
  status="$(curl -s -o /tmp/birgefund_admin_response.json -w "%{http_code}" \
    "$API_URL/admin/dashboard" \
    -H "Authorization: Bearer $token")"

  if [[ "$status" != "$expected_status" ]]; then
    echo "ERROR: admin access for $email expected $expected_status, got $status"
    cat /tmp/birgefund_admin_response.json
    echo
    exit 1
  fi

  echo "OK: admin access $email -> $status"
}

check_health

check_me_role "backer@birgefund.kg" "BackerPass123!" "backer"
check_me_role "author@birgefund.kg" "AuthorPass123!" "author"
check_me_role "admin@birgefund.kg" "AdminPass123!" "admin"

check_admin_access "backer@birgefund.kg" "BackerPass123!" "403"
check_admin_access "admin@birgefund.kg" "AdminPass123!" "200"

echo
echo "API roles smoke passed"
