/**
 * Shared types + client helper for the Partner Referral workflow.
 *
 * The actual HTTP call to n8n happens in `n8n.functions.ts` (server side) so the
 * browser is never blocked by cross-origin restrictions. The workflow response is
 * passed through untouched — nothing here fabricates or simulates a result.
 */

export type Decision = "QUALIFIED" | "NOT_QUALIFIED" | "NEED_MORE_INFORMATION" | string;

export type EmailPayload = {
  subject?: string;
  body?: string;
};

export type LeadResult = {
  status?: string;
  customer_message?: string;
  sales_email?: EmailPayload;
  partner_email?: EmailPayload;
  decision?: Decision;
  next_action?: string;
};


export function firstObject(value: unknown): LeadResult {
  if (Array.isArray(value)) return firstObject(value[0]);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj["json"] && typeof obj["json"] === "object") return firstObject(obj["json"]);
    if (obj["output"] && typeof obj["output"] === "object") return firstObject(obj["output"]);
    return obj as LeadResult;
  }
  return {};
}

export async function callN8nWebhook(
  url: string,
  message: string,
  fetchImpl: typeof fetch = fetch,
): Promise<LeadResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error("[n8n] non-2xx response", response.status, raw.slice(0, 500));
      if (response.status === 404) {
        throw new Error(
          "The automation workflow is not switched on yet. Activate it in n8n, then try again.",
        );
      }
      throw new Error(`Workflow responded with status ${response.status}`);
    }

    try {
      return parseWorkflowResponse(raw);
    } catch (error) {
      console.error("[n8n] invalid or unexpected response", raw.slice(0, 500));
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The workflow took too long to respond");
    }
    throw error instanceof Error ? error : new Error("Unknown workflow error");
  } finally {
    clearTimeout(timeout);
  }
}

export function parseWorkflowResponse(raw: string): LeadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Workflow returned an unreadable response");
  }

  const result = firstObject(parsed);
  if (!result.customer_message && !result.decision) {
    throw new Error("Workflow returned an unexpected response");
  }

  return result;
}

export const EXAMPLES: { label: string; hint: string; message: string }[] = [
  {
    label: "Qualified lead",
    hint: "Valid referral code",
    message:
      "Hi, I'm Jean Pierre. I'm looking for an insurance quote. My referral code is PARTNER001. My email is jean@example.com.",
  },
  {
    label: "Invalid referral",
    hint: "Unknown partner code",
    message:
      "Hi, I'm Jean Pierre. I'm looking for an insurance quote. My referral code is FAKE999. My email is jean@example.com.",
  },
  {
    label: "Missing information",
    hint: "Not enough detail",
    message: "I need an insurance quote.",
  },
];

export function formatLabel(value?: string) {
  if (!value) return "—";
  return value.replace(/_/g, " ");
}

export function decisionHeadline(decision?: Decision) {
  switch (decision) {
    case "QUALIFIED":
      return {
        title: "Lead qualified",
        note: "The request has sufficient information and the referral partner is verified and active.",
        tone: "positive" as const,
      };
    case "NOT_QUALIFIED":
      return {
        title: "Referral requires attention",
        note: "The referral code could not be verified as an active partner.",
        tone: "warning" as const,
      };
    case "NEED_MORE_INFORMATION":
      return {
        title: "More information needed",
        note: "Some details are missing before this lead can be processed.",
        tone: "neutral" as const,
      };
    default:
      return {
        title: "Lead processed",
        note: "The workflow returned a response for this request.",
        tone: "neutral" as const,
      };
  }
}
