import { useState } from "react";
import { decisionHeadline, formatLabel, type LeadResult } from "@/lib/n8n";

const TONE: Record<string, string> = {
  positive: "border-success/40 bg-success/10 text-success-foreground",
  warning: "border-warning/40 bg-warning/10 text-warning-foreground",
  neutral: "border-border bg-secondary text-secondary-foreground",
};

export function ResultCard({ result }: { result: LeadResult }) {
  const [copied, setCopied] = useState(false);
  const headline = decisionHeadline(result.decision);
  const customerMessage = result.customer_message?.trim();

  async function copy() {
    if (!customerMessage) return;
    try {
      await navigator.clipboard.writeText(customerMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  }

  return (
    <section aria-live="polite" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lead processed
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {headline.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{headline.note}</p>

      <dl className="mt-5 flex flex-wrap gap-3">
        <div className={`rounded-xl border px-4 py-3 ${TONE[headline.tone]}`}>
          <dt className="text-xs font-semibold uppercase tracking-wider opacity-80">Decision</dt>
          <dd className="mt-0.5 text-sm font-semibold">{formatLabel(result.decision)}</dd>
        </div>
        <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-secondary-foreground">
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Next action
          </dt>
          <dd className="mt-0.5 text-sm font-semibold">{formatLabel(result.next_action)}</dd>
        </div>
      </dl>

      <div className="mt-7">
        <h3 className="text-base font-semibold text-foreground">Customer response</h3>
        {customerMessage ? (
          <>
            <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
              {customerMessage}
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            >
              {copied ? "Copied" : "Copy response"}
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            The workflow did not return a customer response for this request.
          </p>
        )}
      </div>
    </section>
  );
}
