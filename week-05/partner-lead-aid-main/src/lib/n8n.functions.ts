import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callN8nWebhook, type LeadResult } from "./n8n";

/**
 * Default endpoint: the n8n PRODUCTION webhook.
 * The workflow must be Active (toggle in the n8n editor) for this URL to respond.
 * Override by setting N8N_WEBHOOK_URL (or VITE_N8N_WEBHOOK_URL) — no code change required.
 */
export const DEFAULT_WEBHOOK_URL =
  "https://gayiti.app.n8n.cloud/webhook/7e14d6cc-1f42-4bf3-b027-5ee040a6c114";

const inputSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(4000),
});

export const processLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<LeadResult> => {
    const url =
      process.env["N8N_WEBHOOK_URL"] ||
      process.env["VITE_N8N_WEBHOOK_URL"] ||
      DEFAULT_WEBHOOK_URL;

    return callN8nWebhook(url, data.message);
  });
