import Link from "next/link";

const nav = [
  ["Dashboard", "/"],
  ["Members", "/members"],
  ["Payments", "/payments"],
  ["Reports", "/reports"],
  ["Reminders", "/reminders"],
  ["Plans", "/plans"],
  ["Settings", "/settings"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="mark">DF</span><span>DEV FITNESS GYM</span></div>
        <nav className="nav">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
