import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl font-bold text-mountain-300">४०४</div>
      <h1 className="mt-4 text-2xl font-bold">पृष्ठ भेटिएन</h1>
      <p className="mt-2 text-[var(--color-muted)]">
        तपाईंले खोज्नुभएको पृष्ठ उपलब्ध छैन वा हटाइएको छ।
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-mountain-600 px-4 py-2 text-sm font-semibold text-white hover:bg-mountain-700"
      >
        मुख्य पृष्ठमा फर्कनुहोस्
      </Link>
    </div>
  );
}
