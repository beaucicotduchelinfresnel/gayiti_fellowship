import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLES,
  callN8nWebhook,
  decisionHeadline,
  firstObject,
  formatLabel,
  parseWorkflowResponse,
} from "../../src/lib/n8n.ts";

describe("Partner Referral workflow transformations", () => {
  it("posts the expected payload and returns the workflow result", async () => {
    let request: { url?: string; body?: string; method?: string } = {};
    const result = await callN8nWebhook("https://example.test/webhook", "hello", async (url, init) => {
      request = { url: String(url), body: String(init?.body), method: init?.method };
      return new Response(JSON.stringify({ decision: "QUALIFIED", customer_message: "Approved" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    assert.equal(request.url, "https://example.test/webhook");
    assert.equal(request.method, "POST");
    assert.deepEqual(JSON.parse(request.body ?? "{}"), { message: "hello" });
    assert.equal(result.decision, "QUALIFIED");
  });

  it("rejects an unreadable response through the HTTP client", async () => {
    await assert.rejects(
      callN8nWebhook("https://example.test/webhook", "hello", async () =>
        new Response("not-json", { status: 200 }),
      ),
      { message: "Workflow returned an unreadable response" },
    );
  });

  it("maps a 404 from n8n to the activation error", async () => {
    await assert.rejects(
      callN8nWebhook("https://example.test/webhook", "hello", async () =>
        new Response("not active", { status: 404 }),
      ),
      {
        message: "The automation workflow is not switched on yet. Activate it in n8n, then try again.",
      },
    );
  });

  it("maps other non-2xx responses to a status error", async () => {
    await assert.rejects(
      callN8nWebhook("https://example.test/webhook", "hello", async () =>
        new Response("server error", { status: 500 }),
      ),
      { message: "Workflow responded with status 500" },
    );
  });

  it("maps fetch failures to an Error object", async () => {
    await assert.rejects(
      callN8nWebhook("https://example.test/webhook", "hello", async () => {
        throw new Error("network down");
      }),
      { message: "network down" },
    );
  });

  it("maps an aborted request to the timeout error", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    await assert.rejects(
      callN8nWebhook("https://example.test/webhook", "hello", async () => {
        throw abortError;
      }),
      { message: "The workflow took too long to respond" },
    );
  });

  it("unwraps an n8n array response", () => {
    assert.deepEqual(firstObject([{ decision: "QUALIFIED", customer_message: "Approved" }]), {
      decision: "QUALIFIED",
      customer_message: "Approved",
    });
  });

  it("unwraps nested n8n json/output wrappers", () => {
    assert.deepEqual(
      firstObject({ output: { json: { decision: "NOT_QUALIFIED" } } }),
      { decision: "NOT_QUALIFIED" },
    );
  });

  it("returns an empty result for non-object workflow output", () => {
    assert.deepEqual(firstObject(null), {});
    assert.deepEqual(firstObject("unexpected"), {});
  });

  it("accepts a valid workflow response", () => {
    assert.deepEqual(
      parseWorkflowResponse(JSON.stringify([{ decision: "QUALIFIED", customer_message: "Approved" }])),
      { decision: "QUALIFIED", customer_message: "Approved" },
    );
  });

  it("rejects unreadable workflow responses", () => {
    assert.throws(() => parseWorkflowResponse("not-json"), {
      message: "Workflow returned an unreadable response",
    });
  });

  it("rejects JSON with no usable workflow result", () => {
    assert.throws(() => parseWorkflowResponse(JSON.stringify({ status: "success" })), {
      message: "Workflow returned an unexpected response",
    });
  });

  it("formats workflow labels for the UI", () => {
    assert.equal(formatLabel("REQUEST_MORE_INFORMATION"), "REQUEST MORE INFORMATION");
    assert.equal(formatLabel(undefined), "—");
  });

  it("maps the three supported decisions to the correct UI headline", () => {
    assert.equal(decisionHeadline("QUALIFIED").title, "Lead qualified");
    assert.equal(decisionHeadline("NOT_QUALIFIED").title, "Referral requires attention");
    assert.equal(decisionHeadline("NEED_MORE_INFORMATION").title, "More information needed");
    assert.equal(decisionHeadline("UNKNOWN_DECISION").title, "Lead processed");
  });

  it("keeps representative happy/error-path examples in the product", () => {
    assert.equal(EXAMPLES.length, 3);
    assert.ok(EXAMPLES.some((example) => example.message.includes("PARTNER001")));
    assert.ok(EXAMPLES.some((example) => example.message.includes("FAKE999")));
    assert.ok(EXAMPLES.some((example) => example.label === "Missing information"));
  });
});
