import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { ProcessingState } from "@/components/ProcessingState";
import { ResultCard } from "@/components/ResultCard";
import { WorkflowDetails } from "@/components/WorkflowDetails";
import { ErrorState } from "@/components/ErrorState";
import { processLead } from "@/lib/n8n.functions";
import type { LeadResult } from "@/lib/n8n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Partner Referral Assistant | AI Lead Workflow" },
      {
        name: "description",
        content:
          "Submit a referral lead and let the AI workflow classify, verify, reason, and respond automatically.",
      },
      { property: "og:title", content: "Partner Referral Assistant" },
      {
        property: "og:description",
        content:
          "Submit a referral lead and let the AI workflow classify, verify, reason, and respond automatically.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "idle" | "processing" | "success" | "error";

function Index() {
  const runWorkflow = useServerFn(processLead);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<LeadResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) {
      setValidationError("Please enter a message before submitting.");
      return;
    }
    setValidationError(null);
    setStatus("processing");
    setResult(null);

    try {
      const data = await runWorkflow({ data: { message: message.trim() } });
      setResult(data);
      setStatus("success");
    } catch (error) {
      console.error("Lead processing failed", error);
      setErrorDetail(error instanceof Error ? error.message : null);
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Gayiti · AI automation
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Partner Referral Assistant
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Submit a referral lead and let the AI workflow classify, verify, reason, and respond
            automatically.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          <LeadForm
            message={message}
            onMessageChange={(value) => {
              setMessage(value);
              if (validationError) setValidationError(null);
            }}
            onSubmit={submit}
            isProcessing={status === "processing"}
            validationError={validationError}
          />

          {status === "processing" ? <ProcessingState /> : null}

          {status === "error" ? <ErrorState onRetry={submit} detail={errorDetail} /> : null}

          {status === "success" && result ? (
            <>
              <ResultCard result={result} />
              <WorkflowDetails result={result} />
            </>
          ) : null}
        </div>

        <footer className="mt-12 text-xs leading-relaxed text-muted-foreground">
          Responses are produced live by the connected automation workflow. Nothing on this page is
          pre-written.
        </footer>
      </div>
    </main>
  );
}
