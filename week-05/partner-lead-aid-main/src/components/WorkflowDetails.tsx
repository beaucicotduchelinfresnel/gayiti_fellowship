import { formatLabel, type LeadResult } from "@/lib/n8n";

function EmailBlock({
  title,
  email,
}: {
  title: string;
  email: { subject?: string; body?: string } | undefined;
}) {
  if (!email || (!email.subject && !email.body)) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {email.subject ? (
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Subject: </span>
          {email.subject}
        </p>
      ) : null}
      {email.body ? (
        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
          {email.body}
        </p>
      ) : null}
    </div>
  );
}

export function WorkflowDetails({ result }: { result: LeadResult }) {
  return (
    <details className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-sm sm:px-7">
      <summary className="cursor-pointer list-none rounded-md text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25">
        <span className="flex items-center justify-between gap-3">
          View workflow details
          <span aria-hidden="true" className="text-muted-foreground transition group-open:rotate-180">
            ▾
          </span>
        </span>
      </summary>

      <div className="mt-5 space-y-6 border-t border-border pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Decision
            </h4>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatLabel(result.decision)}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Next action
            </h4>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatLabel(result.next_action)}
            </p>
          </div>
        </div>

        <EmailBlock title="Sales notification" email={result.sales_email} />
        <EmailBlock title="Partner notification" email={result.partner_email} />
      </div>
    </details>
  );
}
