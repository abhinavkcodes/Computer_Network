import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-xl font-600 text-slate-700">Page not found</p>
        <p className="mt-2 text-slate-600">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-600 rounded-lg hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
