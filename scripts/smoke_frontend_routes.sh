#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "BirgeFund frontend routes smoke"
echo "FRONTEND_URL=$FRONTEND_URL"
echo

check_page() {
  local path="$1"
  local name="$2"

  local status
  status="$(curl -s -o /tmp/birgefund_frontend_page.html -w "%{http_code}" "$FRONTEND_URL$path")"

  if [[ "$status" != "200" ]]; then
    echo "ERROR: $name failed, status=$status, path=$path"
    exit 1
  fi

  if ! grep -q '<div id="root"></div>' /tmp/birgefund_frontend_page.html; then
    echo "ERROR: $name does not look like Vite index.html, path=$path"
    exit 1
  fi

  echo "OK: $name"
}

check_page "/" "home"
check_page "/projects" "projects"
check_page "/login" "login"
check_page "/register" "register"
check_page "/dashboard" "dashboard route"
check_page "/author" "author route"
check_page "/admin" "admin route"
check_page "/pages/test-mode" "cms page route"
check_page "/abrakadabra" "404 route"

echo
echo "Frontend routes smoke passed"
