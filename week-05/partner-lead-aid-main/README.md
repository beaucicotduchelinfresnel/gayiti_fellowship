# Partner Referral Assistant

An AI-powered internal tool for processing partner referral leads. A team member pastes a lead's
natural-language request, and a multi-agent n8n workflow classifies it, extracts the lead details,
verifies the referral partner, decides the next action, and writes the customer response.

## Project overview

- One primary workflow screen — no dashboards, no login.
- The message is sent to a real n8n webhook. The UI renders only what the workflow returns.
- Three business outcomes are supported: `QUALIFIED`, `NOT_QUALIFIED`, `NEED_MORE_INFORMATION`.
- Sales and partner notification emails returned by the workflow are shown in an expandable
  "View workflow details" section.

Nothing in the UI is mocked, hardcoded, or simulated.

## Architecture

```text
Frontend (React + TanStack Start)
  -> server function proxy (/lib/n8n.functions.ts)
    -> n8n webhook
      -> Classifier Agent
      -> Extractor Agent
      -> Google Sheets partner lookup
      -> Reasoner Agent
      -> Composer Agent
      -> Final JSON response
```

The webhook call is isolated in a single reusable function, `processLead(message)`, in
`src/lib/n8n.functions.ts`. It runs server-side so the browser is never blocked by cross-origin
restrictions on the n8n endpoint; the payload and response pass through untouched.

Expected response shape:

```json
{
  "status": "success",
  "customer_message": "...",
  "sales_email": { "subject": "...", "body": "..." },
  "partner_email": { "subject": "...", "body": "..." },
  "decision": "QUALIFIED",
  "next_action": "PROCESS_LEAD"
}
```

Arrays and `{ json: ... }` / `{ output: ... }` wrappers that n8n sometimes emits are unwrapped
automatically.

## Project structure

```text
src/
  components/
    LeadForm.tsx          form, character count, example chips
    ProcessingState.tsx   processing indicator
    ResultCard.tsx        decision, next action, customer response, copy button
    WorkflowDetails.tsx   expandable sales/partner notifications
    ErrorState.tsx        failure state with retry
  lib/
    n8n.ts                shared types, examples, decision copy
    n8n.functions.ts      the single webhook call
  routes/
    index.tsx             the main workflow screen
```

## Local development

Requires Node.js 20+ (or Bun).

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production build
npm run lint
```

## Environment variables

The webhook URL is configurable, so it can be swapped without touching code:

| Variable           | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `N8N_WEBHOOK_URL`  | Webhook the workflow request is POSTed to. |

`VITE_N8N_WEBHOOK_URL` is also accepted for parity with Vite-style conventions. When unset,
the app falls back to the default production endpoint configured in `src/lib/n8n.functions.ts`.

Example `.env`:

```bash
N8N_WEBHOOK_URL=
```

Do not commit real credentials or sensitive values. This project does not require front-end API
secrets; only the public webhook URL should be configured in the deployment environment.

## Workflow outcomes

| Decision                | UI headline                    | Typical next action          |
| ----------------------- | ------------------------------ | ---------------------------- |
| `QUALIFIED`             | Lead qualified                 | `PROCESS_LEAD`               |
| `NOT_QUALIFIED`         | Referral requires attention    | `REQUEST_VALID_REFERRAL`     |
| `NEED_MORE_INFORMATION` | More information needed        | `REQUEST_MORE_INFORMATION`   |

In every case the customer-facing text shown is the workflow's own `customer_message`.

## Error handling

- **Empty input** — blocked client-side with "Please enter a message before submitting." The webhook
  is not called.
- **Network failure, timeout (120s), non-2xx, unreadable or unexpected JSON** — a single clear error
  state: "We couldn't process this request", with a **Try again** button.
- Technical detail (status codes, response bodies, stack traces) goes to the console/server logs
  only, never to the screen.

## Known limitations

- The production webhook only responds while the workflow is **Active** (the toggle in the
  top-right of the n8n editor). If it is inactive, the endpoint returns a 404 and the app shows
  its clear error state with a **Try again** button. Unlike the old test URL, no manual
  "Execute workflow" click is needed — an active workflow answers every call automatically.
- Processing stages shown while loading are a visual indication of progress, not per-agent telemetry;
  n8n does not stream intermediate state.
- No persistence — submitted leads are not stored by the frontend.

## Deployment

The project is intended to run as a public front-end prototype, but the live URL must be set up in
its deployment environment after the repository is pushed and the app is published.

For a simple deployment flow:

1. Push the repository to GitHub.
2. Import the project in a Node-compatible host such as Vercel or Cloudflare.
3. Set `N8N_WEBHOOK_URL` to the public n8n production webhook URL in the deployment environment.
4. Run the production build with `npm run build`.
5. Publish the site and share the final public URL once the deployment is live.

## Live Demo

Local development demo:

- http://localhost:8080

Production URL:

- Add after deployment to the hosting platform.

## Repository

https://github.com/beaucicotduchelinfresnel/partner-lead-aid

## Testing

Week 10 hardening focuses on the critical referral workflow rather than coverage for its own sake.
The test suite covers the n8n boundary: request payloads, successful responses, n8n array/wrapper
formats, malformed JSON, unexpected response shapes, 404 activation errors, other non-2xx responses,
network failures, timeouts, and the three supported UI decisions.

Run locally with Node.js 22+:

```bash
npm test
```

The repository uses Node's built-in test runner, so no additional test framework is required. Coverage
can be generated with:

```bash
npm run test:coverage
```

The latest local run reported **100% line coverage for `src/lib/n8n.ts`**, with **94.59% branch
coverage**. The full test run reported **15 passing tests and 1 skipped test**. The skipped test is the
live n8n integration test and only runs when `N8N_TEST_WEBHOOK_URL` is provided.

### Live n8n integration test

To exercise the real n8n workflow end-to-end, provide a safe test webhook URL:

```bash
N8N_TEST_WEBHOOK_URL="https://..." npm test
```

The integration test sends the safe missing-information payload `I need an insurance quote.` and
verifies that n8n returns a usable workflow result. Use a dedicated staging/test webhook when possible
to avoid triggering production side effects such as notification emails.

### CI

GitHub Actions runs `npm install` and `npm test` on every pull request and every push to `main`.
The live n8n integration test remains opt-in so normal CI does not depend on a production workflow or
its side effects.
