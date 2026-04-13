import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  if (!session.user.homeId) {
    return <main className="p-8">No home assigned yet.</main>;
  }

  const rooms = await prisma.room.findMany({
    where: { homeId: session.user.homeId },
    include: {
      devices: {
        include: {
          switches: true
        }
      }
    }
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{session.user.role} Dashboard</h1>
      <Dashboard rooms={rooms} homeId={session.user.homeId} />
    </main>
  );
}
