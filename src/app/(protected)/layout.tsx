import { AppShell } from "@/components/app-shell";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { verifyUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await verifyUser();
  return <AppShell><RealtimeRefresh />{children}</AppShell>;
}
