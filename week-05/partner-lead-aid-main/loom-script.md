# Week 10 Loom — From Demo to Real

Target length: 5–7 minutes.

## 00:00–00:30 — Context

“Last week I shipped the Partner Referral Assistant as a working end-to-end prototype. This week I chose one production hardening path: testing.

The reason is simple: the happy path already works. The next risk is regression — making a change and discovering later that the referral workflow no longer handles an important case correctly.”

## 00:30–01:20 — What changed

“Instead of adding another feature, I hardened the existing critical path.

The flow is: user message, server-side request to n8n, HTTP and timeout handling, response parsing, then the decision and customer message shown in the UI.

I extracted the n8n boundary into a testable function and added deterministic tests around that boundary. I also added a live integration test that can exercise a real n8n webhook when a safe test URL is provided.”

Show:
- `src/lib/n8n.ts`
- `src/lib/n8n.functions.ts`
- `tests/unit/n8n.test.ts`
- `tests/integration/n8n-webhook.test.ts`

## 01:20–02:30 — Critical tests

“Here are the cases I decided were worth protecting.

First, the request must be a POST with the expected `{ message }` payload. Then I test the successful response. Because n8n can return arrays or wrapped objects, I test those response formats too.

On the failure side, I test an inactive workflow returning 404, other HTTP failures, network failures, malformed JSON, unexpected response shapes, and timeout behavior.

Finally, I test the three business decisions the UI supports: qualified, not qualified, and more information needed.”

## 02:30–03:40 — Run the tests

Run:

```bash
npm test
```

Say:

“The current run has 16 tests discovered: 15 passing and one skipped. The skipped test is intentional because the live n8n integration requires `N8N_TEST_WEBHOOK_URL`; I don't want normal CI to depend on a production workflow or accidentally trigger downstream actions.”

If useful, point out the 404 and network/error tests passing.

## 03:40–04:30 — Coverage

Run:

```bash
npm run test:coverage
```

Say:

“The goal here is not 100% coverage everywhere. I focused coverage on the critical workflow module. The latest run gives `src/lib/n8n.ts` 100% line coverage and 94.59% branch coverage.

That number matters because these tests protect behavior that can break even when the UI still looks completely normal.”

## 04:30–05:15 — CI

Show `.github/workflows/tests.yml`.

Say:

“I also added GitHub Actions so the test suite runs on every pull request and every push to main. That means the safety net is not only on my machine; it becomes part of the repository workflow.”

## 05:15–06:00 — Production lesson

“The biggest lesson is that a demo proves something works once. Production engineering is about creating evidence that important behavior still works after the next change.

I also learned that integration tests need boundaries. A real n8n test is valuable, but production workflows can have real side effects, so the live integration test is explicit and configurable instead of being forced into every CI run.

This week moved the Partner Referral Assistant from a working demo toward a system that is harder to break.”
