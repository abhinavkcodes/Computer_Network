import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold" style={{ color: "var(--text-primary)" }}>
          404
        </h1>
        <p className="mt-4 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Page not found
        </p>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/" className="btn btn-primary mt-8 inline-flex">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}