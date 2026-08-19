import { AppShell } from "@/components/app-shell";
import { verifyUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await verifyUser();
  return <AppShell>{children}</AppShell>;
}