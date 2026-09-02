Project briefs
Project 1 — n8n: choose one path
Both paths ship a real automation an agency could deploy this quarter. Week 1 is the n8n plumbing; later modules layer error handling (M2), LLM intelligence (M3), a UI surface (M4), polish + demo (M5), and production hardening (M6). Your pick here is the project you carry the full ten weeks. Expand each path below to read the brief and acceptance criteria.


Path A · Voice Agent (Outbound Caller)
Build a workflow that places real outbound calls on behalf of an agency. Contact information lands as input (via webhook, Sheets row, or trigger); the workflow parses the contact + business context, hands it to a voice-AI provider (Bland, Vapi, Retell, or similar) that places the actual call, captures the conversation outcome, and persists a structured record of what was said and what to do next.

This is the foundation pattern for every outbound automation an agency runs — outbound prospecting, renewal calls, appointment confirmations, lead qualification. The Week 1 version uses a scripted prompt; M3 layers real agent reasoning on top.

Why this matters: agencies and insurance teams spend hours on the phone doing the same conversation 50 times a day. The economics flip the moment one workflow can run those conversations in parallel.

Acceptance criteria
01
Trigger that receives contact info (name, phone, context fields) — webhook, Sheets row, or manual button.
02
Integration with a voice-AI calling API (Bland, Vapi, Retell, ElevenLabs Conversational, or similar) that places the actual outbound call.
03
The call prompt includes contact context + business context (who is calling, why, what to ask).
04
Captured outcome — call status, conversation summary, structured fields the agent extracted (interested / not / callback time / etc.).
05
Persistent write of the call record + outcome to Sheets, Airtable, or a CRM.
06
Tested with 3 real calls (your own phone is fine) covering different outcomes: interested, not interested, voicemail.

Path B · Referral Partner Program
Build the engine behind an agency's partner-referral program. A webhook receives a referral (partner_code, prospect details, intent); the workflow validates the partner, persists the lead with attribution, notifies the sales team in Slack, sends the partner a confirmation, and welcomes the prospect via a templated email.

Why this matters: most agencies grow through partner referrals but track them in spreadsheets manually. Automating attribution + notification turns referrals from a side activity into a real growth channel.

Acceptance criteria
01
Webhook trigger accepting POST with partner_code and prospect data.
02
Partner validation step that rejects unknown codes with a clear error.
03
Persistent write to Sheets / Airtable with an attribution column.
04
Slack or email notification to the sales team with lead + partner context.
05
Two outgoing emails — partner confirmation and prospect welcome.
06
Tested with 3 cases: valid partner, unknown partner, missing required field.
Project 2 — Tasklet: choose one path
Both paths are real agency-operations systems — bigger than "set up my personal workspace." Like the n8n project, you carry your choice through later modules: M2 hooks Tasklet into your n8n workflows, M3 adds LLM-driven decisions, M4 adds an operator-facing UI, M5 polishes for handoff. Expand each path to read the brief and acceptance criteria.


Path A · Customer Retention Workflow
Build a Tasklet automation that proactively manages an agency's book of business. The workflow tracks health signals (login recency, support tickets, renewal dates, NPS), surfaces accounts at risk, generates outreach tasks with full context for the account manager, and follows up automatically when tasks slip.

Why this matters: most agencies lose 15–25% of customers per year. Half of that churn is preventable with one proactive conversation. The data is sitting there — nobody surfaces it in time. This is the closed loop that catches churn before it happens.

Acceptance criteria
01
Workspace with at least 3 lists: "At-Risk This Week", "Active Outreach", "Saved / Returned".
02
Automation rules covering at least 3 risk triggers (30 days no login, NPS < 7, support escalation, renewal within 60 days).
03
Each surfaced account generates a task with full context — why surfaced + suggested next step.
04
Follow-up automation that escalates to a manager if the task isn't actioned in 48 hours.
05
Sample data populated to demonstrate the flow end-to-end (5–10 sample customers).
06
Screenshot + 200-word note on how an account manager uses this daily.

Path B · Proposal Generator
Build a Tasklet workflow that takes an agency from "deal landed" to "proposal sent + tracked" without anyone re-typing the boilerplate. New opportunities trigger a templated proposal draft (pulling deal data + reusable pricing / scope / terms blocks), the draft routes through internal approval, the approved version is sent to the prospect, and follow-up tasks auto-generate based on open / click activity.

Why this matters: agencies lose deals because proposals take days to draft. Automating the boring 80% (data, pricing tables, terms) frees the human to focus on the 20% that wins (positioning, strategy). Same pattern works for insurance quote generation.

Acceptance criteria
01
Workspace structured around the proposal pipeline: Drafting / Internal Review / Sent / Won-Lost.
02
Template-driven proposal generation with at least 3 reusable blocks (pricing tier, scope, terms) that auto-pull into new proposals.
03
Internal approval step that blocks send until a reviewer signs off.
04
Activity tracking after send — open, click, follow-up threshold.
05
Auto-generated follow-up tasks based on engagement signals.
06
Screenshot + 200-word note explaining one proposal's lifecycle through the system.