# Multi-Agent Team Inside The Workflow

## 1. Project Overview

This workflow rebuilds the decision and reasoning layer of the original lead-processing workflow as a **multi-agent team**.

Instead of using one large AI agent for every task, the workflow divides responsibilities between specialized agents. Each agent has one clearly defined responsibility and produces structured JSON that can be validated before the workflow continues.

### Agents

| Agent                | Responsibility                               |
| -------------------- | -------------------------------------------- |
| **Classifier Agent** | Classifies the user's request                |
| **Extractor Agent**  | Extracts structured lead information         |
| **Reasoner Agent**   | Determines the appropriate workflow decision |
| **Composer Agent**   | Produces the final communication payload     |

The Classifier and Extractor operate in **parallel** because their tasks are independent. Their outputs are then combined before the workflow continues to partner verification and reasoning.

---

# 2. Workflow Architecture

```text
                    ┌──────────────────────┐
                    │   Input / Trigger    │
                    └──────────┬───────────┘
                               │
                        ┌──────▼──────┐
                        │ Edit Fields │
                        └──────┬──────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Classifier      │         │ Extractor       │
        │ Agent           │         │ Agent           │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Validate        │         │ Validate        │
        │ Classifier      │         │ Extractor       │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Classifier      │         │ Extractor       │
        │ Fallback        │         │ Fallback        │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Combine Lead Data   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Partner Lookup      │
                    │ Google Sheets       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Partner Lookup      │
                    │ Fallback             │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Reasoner Agent      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Validate Reasoner   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Reasoner Fallback   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Assemble Composer   │
                    │ Context             │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Composer Agent      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Validate Composer   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Composer Fallback   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Final Output     │
                    └─────────────────────┘
```

### Parallel Processing

The workflow contains a parallel agent pair:

```text
                 Edit Fields
                /           \
               ▼             ▼
        Classifier       Extractor
           Agent            Agent
               \             /
                ▼           ▼
                 Combine
```

The two agents do not depend on each other's output, so they can execute independently before their results are combined.

---

# 3. Agent 1 — Classifier Agent

## Responsibility

The Classifier Agent's **only responsibility** is to classify the user's request.

It determines:

* Intent
* Category
* Priority
* Confidence

It does **not** extract customer information, verify partners, make business decisions, or write messages.

## System Prompt

```text
You are the Classifier Agent.

Your ONLY responsibility is to classify the user's request.

Determine:
1. intent
2. category
3. priority
4. confidence

Allowed intent examples:
- request_insurance_quote
- general_question
- support_request
- unknown

Allowed category examples:
- insurance_quote
- sales_lead
- support
- unknown

Priority must be:
- low
- medium
- high

Rules:
- Do NOT extract personal information.
- Do NOT make business decisions.
- Do NOT determine whether a partner is valid.
- Do NOT write emails or customer messages.
- Never invent information.
- If the request is unclear, use "unknown".
- confidence must be a number between 0 and 1.
- Return only the structured output required by the output parser.
```

## Output Schema

```json
{
  "intent": "string",
  "category": "string",
  "priority": "string",
  "confidence": "number"
}
```

## Example

```json
{
  "intent": "request_insurance_quote",
  "category": "insurance_quote",
  "priority": "medium",
  "confidence": 0.95
}
```

---

# 4. Agent 2 — Extractor Agent

## Responsibility

The Extractor Agent's **only responsibility** is to extract structured information from the user's message.

It extracts:

* Full name
* Email
* Company
* Partner code
* Request

The agent does not classify the request or make workflow decisions.

## System Prompt

```text
You are the Extractor Agent.

Your ONLY responsibility is to extract structured information from the user's message.

Extract:
- full_name
- email
- company
- partner_code
- request

Rules:
- Do not classify the request.
- Do not determine priority.
- Do not make business decisions.
- Do not recommend actions.
- Do not write messages.
- Never invent information.
- If a field is missing, return an empty string.
- Return only the required structured JSON output.
```

## Output Schema

```json
{
  "full_name": "string",
  "email": "string",
  "company": "string",
  "partner_code": "string",
  "request": "string"
}
```

## Example

```json
{
  "full_name": "David",
  "email": "david@example.com",
  "company": "",
  "partner_code": "",
  "request": "I need an insurance quote for my company."
}
```

A missing `partner_code` is represented by an empty string rather than causing the entire workflow to fail.

---

# 5. Agent 3 — Reasoner Agent

## Responsibility

The Reasoner Agent's **only responsibility** is to determine the next workflow action using:

* Classified request information
* Extracted lead information
* Verified partner information

It determines:

* Decision
* Next action
* Whether Sales should be notified
* Whether the Partner should be notified
* Reason

The Reasoner does not write customer-facing messages.

## System Prompt

```text
You are the Reasoner Agent.

Your ONLY responsibility is to determine the next workflow action based on the classified request, extracted information, and verified partner information.

The input contains:

* partner_code, partner_name, partner_email, and active at the top level
* classified and extracted information inside the "output" object

Use the actual partner verification data provided in the input.

Determine:

1. decision
2. next_action
3. notify_sales
4. notify_partner
5. reason

Partner verification rules:

* If active is true, the partner is verified and active.
* If active is false, the partner is not active.
* If no partner record is found, the partner is unverified.

Decision rules:

* If the partner is verified and active and the lead contains sufficient information to be processed, decision must be QUALIFIED.
* If the partner is not active or unverified, decision must be NOT_QUALIFIED.
* If required information is missing, decision must be NEED_MORE_INFORMATION.

Action rules:

* QUALIFIED → PROCESS_LEAD
* NOT_QUALIFIED → REQUEST_VALID_REFERRAL
* NEED_MORE_INFORMATION → REQUEST_MORE_INFORMATION

Notification rules:

* If decision is QUALIFIED and next_action is PROCESS_LEAD, notify_sales must be true.
* If the lead is QUALIFIED and should be processed, notify_partner must be true.
* If decision is NOT_QUALIFIED, notify_sales must be false and notify_partner must be false.
* If decision is NEED_MORE_INFORMATION, notify_sales must be false and notify_partner must be false.

General rules:

* Do NOT write customer-facing messages.
* Do NOT write emails.
* Do NOT extract information.
* Do NOT reclassify the request.
* Do NOT invent information.
* Base your decision only on the information provided.
* If required information is missing, request more information.
* Return only the structured output required by the output parser.
* Never invent or alter upstream facts.
* If referring to priority, use exactly the priority provided by the Classifier.
* If priority is not provided, do not mention priority in the reason.
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "decision": {
      "type": "string",
      "enum": [
        "QUALIFIED",
        "NOT_QUALIFIED",
        "NEED_MORE_INFORMATION"
      ]
    },
    "next_action": {
      "type": "string",
      "enum": [
        "PROCESS_LEAD",
        "REQUEST_VALID_REFERRAL",
        "REQUEST_MORE_INFORMATION"
      ]
    },
    "notify_sales": {
      "type": "boolean"
    },
    "notify_partner": {
      "type": "boolean"
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "decision",
    "next_action",
    "notify_sales",
    "notify_partner",
    "reason"
  ],
  "additionalProperties": false
}
```

## Example

```json
{
  "decision": "QUALIFIED",
  "next_action": "PROCESS_LEAD",
  "notify_sales": true,
  "notify_partner": true,
  "reason": "Partner record PARTNER001 is verified and active. Sufficient lead information is available to process the request."
}
```

---

# 6. Agent 4 — Composer Agent

## Responsibility

The Composer Agent's **only responsibility** is to transform the approved Reasoner decision into the final communication payload.

It produces:

* Customer message
* Sales email
* Partner email

The Composer does not make the business decision. It uses the decision already approved by the Reasoner.

## System Prompt

```text
You are the Composer Agent.

Your ONLY responsibility is to transform the approved Reasoner decision into the final communication payload.

The input contains:

* the original classified and extracted lead information
* verified partner information
* the Reasoner Agent's approved decision
* the next workflow action
* notification instructions

Create a structured communication payload containing:

1. customer_message
2. sales_email
3. partner_email

Rules:

* Do NOT change the Reasoner Agent's decision.
* Do NOT change next_action.
* Do NOT change notify_sales or notify_partner.
* Do NOT invent missing customer information.
* Do NOT invent partner information.
* Do NOT make business decisions.
* Do NOT reclassify the request.
* Use only information provided in the input.
* If notify_sales is false, sales_email must contain empty subject and body.
* If notify_partner is false, partner_email must contain empty subject and body.
* If the decision is QUALIFIED, create a professional customer message confirming that the request can be processed.
* Keep customer messages clear and concise.
* Sales and partner emails must contain only information relevant to their respective recipient.
* Return only the structured output required by the output parser.
* Never expose internal workflow terms such as QUALIFIED, PROCESS_LEAD, notify_sales, notify_partner, or internal decision logic to the customer.
* Use the actual customer name and email provided in the input when composing internal notifications.
* Do not say that information was "provided" if the actual value is available.
* Customer messages must be written for the customer, not for internal workflow processing.
```

## Output Schema

```json
{
  "type": "object",
  "properties": {
    "customer_message": {
      "type": "string"
    },
    "sales_email": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string"
        },
        "body": {
          "type": "string"
        }
      },
      "required": [
        "subject",
        "body"
      ],
      "additionalProperties": false
    },
    "partner_email": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string"
        },
        "body": {
          "type": "string"
        }
      },
      "required": [
        "subject",
        "body"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "customer_message",
    "sales_email",
    "partner_email"
  ],
  "additionalProperties": false
}
```

---

# 7. Validation and Fallback Strategy

Each AI agent is followed by a validation step.

The purpose of validation is to ensure that an agent does not send malformed or unusable data to the next stage.

## Classifier

The Classifier validator checks that:

* `intent` exists
* `category` exists
* `priority` exists
* `confidence` is between 0 and 1

If validation fails, the Classifier Fallback provides:

```json
{
  "intent": "unknown",
  "category": "unknown",
  "priority": "medium",
  "confidence": 0
}
```

---

## Extractor

The Extractor validator checks the required structured fields.

Missing optional information is represented as an empty string.

For example:

```json
{
  "full_name": "David",
  "email": "david@example.com",
  "company": "",
  "partner_code": "",
  "request": "I need an insurance quote."
}
```

The workflow can continue even when the partner code is missing.

If the Extractor output itself is invalid, the Extractor Fallback provides a safe structured response so the workflow does not receive malformed AI data.

---

## Reasoner

The Reasoner validator checks that:

* `decision` exists
* `next_action` exists
* `notify_sales` is boolean
* `notify_partner` is boolean
* `reason` exists

If validation fails, the Reasoner Fallback returns:

```json
{
  "decision": "NEED_MORE_INFORMATION",
  "next_action": "REQUEST_MORE_INFORMATION",
  "notify_sales": false,
  "notify_partner": false,
  "reason": "Reasoner validation failed."
}
```

This prevents an invalid reasoning response from automatically triggering sales or partner notifications.

---

## Composer

The Composer validator checks the required final communication structure.

The output must contain:

* `customer_message`
* `sales_email`
* `partner_email`

Each email must contain:

* `subject`
* `body`

If the Composer fails validation, the Composer Fallback generates a safe customer-facing response and prevents invalid notification data from reaching the final output.

---

# 8. Partner Lookup and Fallback

Partner verification is performed using a Google Sheets Partner Directory.

The lookup uses:

```text
partner_code
```

as the lookup key.

For example:

```text
PARTNER001
```

returns the verified partner information.

If no partner is found, the **Partner Lookup Fallback** ensures that the workflow still produces one structured partner-status item:

```json
{
  "row_number": null,
  "partner_code": "",
  "partner_name": "",
  "partner_email": "",
  "active": false,
  "partner_verified": false
}
```

This allows the Reasoner Agent to explicitly determine that the referral is unverified instead of causing the workflow to stop.

---

# 9. Data Combination

Because the Classifier and Extractor operate independently, their outputs are combined before partner verification.

The `Combine Lead Data` step merges their non-overlapping fields into one structured object.

This preserves both:

```text
Classifier output
+
Extractor output
```

and prevents one agent's `output` object from overwriting the other's data.

The workflow later uses `Assemble Composer Context` to reconstruct the complete context required by the Composer.

This ensures the Composer receives:

* Original classification
* Extracted customer information
* Partner information
* Reasoner decision
* Notification instructions

---

# 10. Test Scenarios

The workflow is tested with three real inputs.

### Test 1 — Valid Partner

A customer provides a valid partner referral code such as:

```text
PARTNER001
```

Expected reasoning:

```text
QUALIFIED
→ PROCESS_LEAD
```

Sales and partner notifications are enabled.

---

### Test 2 — Invalid Partner

A customer provides an invalid referral code such as:

```text
FAKE999
```

Expected reasoning:

```text
NOT_QUALIFIED
→ REQUEST_VALID_REFERRAL
```

Sales and partner notifications remain disabled.

---

### Test 3 — Missing Partner Code

A customer requests an insurance quote without providing a partner code.

Expected reasoning:

```text
NOT_QUALIFIED
→ REQUEST_VALID_REFERRAL
```

The workflow does not crash. The Partner Lookup Fallback provides a structured unverified partner result, allowing the Reasoner and Composer to complete the workflow.

---

# 11. Multi-Agent Design Principles

The workflow follows four main principles:

### Single Responsibility

Each agent performs one specific task.

```text
Classifier → Classification
Extractor  → Extraction
Reasoner   → Decision
Composer   → Communication
```

### Structured Communication

Agents communicate using structured JSON rather than free-form text.

### Validation Before Continuation

Agent output is validated before being passed to downstream processing.

### Safe Fallbacks

Invalid or missing AI output does not automatically stop the entire workflow.

---

# 12. Final Result

The final workflow produces a structured result containing:

```json
{
  "status": "success",
  "customer_message": "...",
  "sales_email": {
    "subject": "...",
    "body": "..."
  },
  "partner_email": {
    "subject": "...",
    "body": "..."
  },
  "decision": "QUALIFIED",
  "next_action": "PROCESS_LEAD"
}
```

The result combines the work of the specialized agents into one final structured output.

---

## Assignment Requirement Mapping

| Requirement            | Implementation                            |
| ---------------------- | ----------------------------------------- |
| 3+ distinct agents     | 4 specialized agents                      |
| Named responsibilities | Classifier, Extractor, Reasoner, Composer |
| Parallel execution     | Classifier + Extractor                    |
| Combiner               | Combine Lead Data + Composer Context      |
| Structured outputs     | JSON schemas                              |
| Validation             | Validator node after each AI agent        |
| Fallback               | Dedicated fallback paths                  |
| Real inputs            | 3 test scenarios                          |
| Final combined result  | Final Output Handling                     |
| Partner verification   | Google Sheets + Partner Lookup Fallback   |

---

## Conclusion

The workflow demonstrates a multi-agent architecture in which specialized AI agents collaborate through structured data.

The main design improvement is the separation of responsibilities:

**Classify → Extract → Verify → Reason → Compose**

This makes the workflow easier to validate, debug, extend, and control than a single large AI reasoning step.

