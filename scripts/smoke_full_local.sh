#!/usr/bin/env bash
set -euo pipefail

echo "BirgeFund full local smoke"
echo

echo "1) Frontend build"
cd frontend
npm run build
cd ..

echo
echo "2) Frontend routes"
./scripts/smoke_frontend_routes.sh

echo
echo "3) Backend roles/API"
./scripts/smoke_api_roles.sh

echo
echo "FULL SMOKE PASSED"
