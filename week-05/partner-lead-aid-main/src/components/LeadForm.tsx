import { EXAMPLES } from "@/lib/n8n";

type Props = {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  validationError: string | null;
};

const MAX = 4000;

export function LeadForm({
  message,
  onMessageChange,
  onSubmit,
  isProcessing,
  validationError,
}: Props) {
  return (
    <form
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <label htmlFor="lead-message" className="block text-base font-semibold text-foreground">
        Lead message
      </label>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste or type the request exactly as the person wrote it.
      </p>

      <textarea
        id="lead-message"
        name="message"
        value={message}
        maxLength={MAX}
        onChange={(event) => onMessageChange(event.target.value)}
        disabled={isProcessing}
        rows={6}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={validationError ? "lead-message-error" : "lead-message-count"}
        placeholder="Example: I'm Jean Pierre. I need an insurance quote. My referral code is PARTNER001 and my email is jean@example.com."
        className="mt-4 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-base leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 disabled:opacity-60"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p id="lead-message-count" className="text-xs text-muted-foreground">
          {message.length} / {MAX} characters
        </p>
        {validationError ? (
          <p id="lead-message-error" role="alert" className="text-sm font-medium text-destructive">
            {validationError}
          </p>
        ) : null}
      </div>

      <fieldset className="mt-5" disabled={isProcessing}>
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Example inputs
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onMessageChange(example.message)}
              className="rounded-full border border-border bg-secondary px-3.5 py-2 text-left text-sm font-medium text-secondary-foreground transition hover:border-ring hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 disabled:opacity-60"
            >
              {example.label}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{example.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isProcessing}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {isProcessing ? "Processing lead..." : "Process Lead"}
      </button>
    </form>
  );
}
