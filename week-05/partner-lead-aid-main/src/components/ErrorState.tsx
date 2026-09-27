type Props = {
  onRetry: () => void;
  detail?: string | null;
};

export function ErrorState({ onRetry, detail }: Props) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm sm:p-7"
    >
      <h2 className="text-lg font-semibold text-foreground">We couldn&apos;t process this request</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {detail ?? "Something went wrong while connecting to the automation workflow. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
      >
        Try again
      </button>
    </section>
  );
}
