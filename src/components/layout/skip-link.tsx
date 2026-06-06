export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-accent focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
    >
      {label}
    </a>
  );
}
