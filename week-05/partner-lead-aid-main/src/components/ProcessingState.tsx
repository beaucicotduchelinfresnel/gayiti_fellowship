const STEPS = [
  "Analyzing request",
  "Extracting lead information",
  "Verifying referral",
  "Determining next action",
  "Preparing response",
];

export function ProcessingState() {
  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
    >
      <h2 className="text-lg font-semibold text-foreground">Processing your request</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The automation workflow is running. This usually takes a few seconds.
      </p>
      <ul className="mt-5 space-y-3">
        {STEPS.map((step) => (
          <li key={step} className="flex items-center gap-3 text-sm text-foreground">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 animate-pulse rounded-full bg-primary"
            />
            {step}
          </li>
        ))}
      </ul>
    </section>
  );
}
