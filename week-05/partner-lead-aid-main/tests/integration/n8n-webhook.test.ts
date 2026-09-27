import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseWorkflowResponse } from "../../src/lib/n8n.ts";

const webhookUrl = process.env.N8N_TEST_WEBHOOK_URL;

describe("n8n production workflow integration", () => {
  it("processes a real lead through n8n", async (t) => {
    if (!webhookUrl) {
      t.skip("Set N8N_TEST_WEBHOOK_URL to run the live n8n integration test.");
      return;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I need an insurance quote." }),
    });

    assert.equal(response.ok, true, `Expected 2xx from n8n, received ${response.status}`);
    const raw = await response.text();
    const result = parseWorkflowResponse(raw);

    assert.ok(result.customer_message || result.decision);
  });
});
