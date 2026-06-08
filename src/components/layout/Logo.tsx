import Link from "next/link";

/** Логотип «Колибри»: лёгкий SVG-силуэт колибри + название. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className ?? ""}`}
      aria-label="kolibri_flowers — на главную"
    >
      <span className="text-accent-2 transition-transform duration-500 group-hover:-rotate-6">
        <HummingbirdIcon />
      </span>
      <span className="font-serif text-xl tracking-tight text-ink">
        kolibri<span className="text-accent">_flowers</span>
      </span>
    </Link>
  );
}

function HummingbirdIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 4c4 0 7 2.5 8.5 6" />
      <path d="M11.5 10c1.6 0 3-1.2 3.4-2.8C15.3 5 17 4 19 4.5c2 .5 2.6 2.6 1.4 4.2-1 1.3-2.7 1.8-4.2 1.6" />
      <path d="M11.5 10c-1.2 1.8-1 4.3.6 5.8L16 19l-1-3.8" />
      <path d="M16.2 10.3 21 13" />
      <circle cx="18.7" cy="6.2" r="0.6" fill="currentColor" />
    </svg>
  );
}
