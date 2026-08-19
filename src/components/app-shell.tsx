"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CalendarRange, CheckSquare2, CircleHelp, Gauge, KeyRound, LogOut, Menu, Network, Scale, Users, X } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/login/actions";

const navigation = [
  ["/", "Dashboard", Gauge], ["/ap/AP1", "AP1 – KDL Pipeline", Network],
  ["/ap/AP2", "AP2 – ProMaster OEE", Network], ["/ap/AP3", "AP3 – ENV", Network],
  ["/tasks", "Tasks", CheckSquare2], ["/open-questions", "Open Questions", CircleHelp],
  ["/decisions", "Decisions", Scale], ["/stakeholders", "Stakeholders", Users],
  ["/access", "Access", KeyRound], ["/roadmap", "Roadmap", CalendarRange],
  ["/activity", "Activity Log", Activity],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="app-frame">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand"><span className="brand-mark">VM</span><div><strong>Brake Lab</strong><small>Project Control</small></div><button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div>
        <nav>{navigation.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? "active" : ""}><Icon size={17} /><span>{label}</span></Link>)}</nav>
        <form action={logout} className="sidebar-footer"><button type="submit"><LogOut size={17} />Sign out</button></form>
      </aside>
      <div className="workspace">
        <header className="topbar"><button className="menu-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><div><span className="system-dot" /> LIVE PROJECT DATA</div><span>KW 35–46 · 2026</span></header>
        {children}
      </div>
      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    </div>
  );
}