export default function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-12 py-12 animate-pulse space-y-10" aria-busy aria-label="Loading checkout">
      <div className="h-10 w-56 rounded-lg bg-kraft/10 mx-auto md:mx-0" />
      <div className="rounded-2xl border border-kraft/10 bg-white p-6 space-y-4">
        <div className="h-40 rounded-xl bg-kraft-pale/50" />
        <div className="h-4 w-3/4 rounded bg-kraft/10" />
        <div className="h-4 w-1/2 rounded bg-kraft/10" />
      </div>
      <div className="rounded-2xl border border-kraft/10 bg-white p-6 space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-4">
            <div className="h-12 rounded-xl bg-offwhite ring-1 ring-kraft/8" />
            <div className="h-12 rounded-xl bg-offwhite ring-1 ring-kraft/8" />
          </div>
        ))}
      </div>
    </div>
  );
}
