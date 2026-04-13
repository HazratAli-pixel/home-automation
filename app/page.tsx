import { auth, signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">Smart Home Automation</h1>
      <p className="text-slate-300">Sign in with email credentials or OAuth provider.</p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button className="w-full rounded bg-indigo-600 px-4 py-2">Continue with Google</button>
      </form>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <button className="w-full rounded border border-slate-700 px-4 py-2">Continue with GitHub</button>
      </form>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button className="w-full rounded border border-red-700 px-4 py-2">Clear Session</button>
      </form>
    </main>
  );
}
