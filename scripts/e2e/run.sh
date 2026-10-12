#!/usr/bin/env bash
# Starts the mock Supabase (54321) and the SES/OpenAI/Resend stubs (4010),
# runs the outreach lifecycle test, then stops them. Test-only credentials
# are in e2e.env; nothing here touches a real service.
set -euo pipefail
cd "$(dirname "$0")"
node mock-supabase.js > mock.log 2>&1 & MOCK=$!
node stubs.js > stubs.log 2>&1 & STUBS=$!
trap 'kill $MOCK $STUBS 2>/dev/null || true; rm -f calls.json agent_reply.json' EXIT
sleep 1
set -a; . ./e2e.env; set +a
cd ../..
npx tsx --tsconfig tsconfig.json --conditions=react-server scripts/e2e/outreach-flow.mts
npx tsx --tsconfig tsconfig.json --conditions=react-server scripts/e2e/lead-flow.mts
npx tsx --tsconfig tsconfig.json --conditions=react-server scripts/e2e/health-flow.mts
