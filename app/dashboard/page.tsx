import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PassDashboardClient } from "@/components/dashboard/pass-dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/#secao-login");
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#F3F4F6]">
      <PassDashboardClient />
    </main>
  );
}
