import type { Metadata } from "next";
import { connection } from "next/server";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  await connection();

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">VM</span>
          <div><strong>Brake Lab</strong><small>Project Control</small></div>
        </div>
        <div className="login-heading">
          <p className="eyebrow">RESTRICTED SYSTEM</p>
          <h1>Engineering work,<br />under control.</h1>
          <p>Sign in to access the VM Brake Lab project workspace.</p>
        </div>
        <LoginForm />
        <p className="login-footnote">Authorized access only · Activity is recorded</p>
      </section>
      <aside className="login-visual" aria-hidden="true">
        <div className="technical-grid" />
        <div className="visual-readout"><span>SYS</span><strong>VM-BL / 26</strong><span>STATUS</span><strong>CONTROL ACTIVE</strong></div>
      </aside>
    </main>
  );
}
