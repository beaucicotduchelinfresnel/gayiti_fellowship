Project brief
Live API Integration + Error Handling
Take your Module 1 workflow (Voice Agent or Referral Partner Program) and bolt on one live external service that makes it materially more useful: enrich a record with data from a third-party (Clearbit, Apollo, Twilio Lookup), post to Slack when something high-value arrives, sync to a CRM (HubSpot, Pipedrive), or call a transcription/translation service. Pick one.

Then add an error branch. What happens when the third-party API is down, rate-limited, or returns garbage? Your workflow must continue serving the lower-priority paths instead of failing silently — and you must be able to see, after the fact, exactly where and why it failed.

Acceptance criteria
01
Authenticated connection to one live third-party API — OAuth or API key, no fake endpoints.
02
The integration meaningfully changes the workflow's output (enrichment, routing, or notification).
03
Explicit error branch that catches at least one failure mode (timeout, rate limit, malformed response).
04
Logged or alerted on failure — you can point to where the failure surfaces.
05
Tested by simulating a failure (disable the API key, send a bad payload).