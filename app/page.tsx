import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Smart Home Automation</h1>
      <p className="text-slate-300">Secure access for Owners, Members, and Guests.</p>

      <Link href="/api/auth/signin" className="w-full rounded bg-indigo-600 px-4 py-2 text-center">
        Sign in (Email or OAuth)
      </Link>

      <Link
        href="/dashboard"
        className="w-full rounded border border-slate-700 px-4 py-2 text-center text-slate-200"
      >
        Open Dashboard
      </Link>
    </main>
  );
}
