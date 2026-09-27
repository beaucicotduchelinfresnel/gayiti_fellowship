# Week 10 — Test Report

## Scope

The test strategy focuses on the critical path rather than maximizing the number of tests:

```text
Lead message
    ↓
server-side n8n request
    ↓
HTTP status / network / timeout handling
    ↓
n8n response parsing
    ↓
Decision + customer message
    ↓
UI transformation
```

## Unit / component-level coverage

The suite verifies:

- Correct POST payload and request method.
- Successful workflow response handling.
- n8n array responses.
- `{ json: ... }` and `{ output: ... }` wrappers.
- Malformed JSON responses.
- Unexpected JSON shapes.
- HTTP 404 workflow-inactive behavior.
- Other non-2xx responses.
- Network failures.
- Abort/timeout error mapping.
- UI formatting for workflow labels.
- All three supported decisions plus an unknown decision fallback.
- Representative product examples for qualified, invalid-referral, and missing-information paths.

## Test result

Local command:

```bash
npm test
```

Result:

- **16 tests discovered**
- **15 passed**
- **0 failed**
- **1 skipped** — live n8n integration test without `N8N_TEST_WEBHOOK_URL`

Coverage command:

```bash
node --test --experimental-strip-types --experimental-test-coverage "tests/**/*.test.ts"
```

Latest local coverage:

| Area | Line | Branch | Functions |
|---|---:|---:|---:|
| `src/lib/n8n.ts` — critical workflow module | **100.00%** | **94.59%** | 83.33% |
| Full measured test run | **96.44%** | **94.29%** | **97.14%** |

The remaining function coverage in `n8n.ts` comes from the default `callN8nWebhook` fetch implementation being exercised through an injected fetch in unit tests; the behavior itself is covered without making external network calls.

## Integration test

`tests/integration/n8n-webhook.test.ts` exercises the real n8n webhook when `N8N_TEST_WEBHOOK_URL` is configured. It is opt-in because production workflows can trigger real downstream actions. The test sends a minimal missing-information request and verifies that the workflow returns a usable decision or customer message.
