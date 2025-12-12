import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

type RootLayoutProps = { children: ReactNode };

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-[0.9rem] text-slate-700 hover:text-slate-950 hover:bg-white/70 transition"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(900px_circle_at_90%_10%,rgba(236,72,153,0.12),transparent_55%),radial-gradient(900px_circle_at_50%_120%,rgba(16,185,129,0.10),transparent_55%)]">
        <div className="min-h-screen flex flex-col">
          {/* Top Nav */}
          <nav className="sticky top-0 z-30">
            <div className="mx-auto max-w-6xl px-4 pt-4">
              <div className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  {/* Brand */}
                  <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-2xl bg-[conic-gradient(from_180deg,rgba(99,102,241,0.9),rgba(236,72,153,0.85),rgba(16,185,129,0.85),rgba(99,102,241,0.9))] shadow-[0_12px_30px_rgba(99,102,241,0.20)]" />
                    <div className="leading-tight">
                      <div className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                        CAS Portfolio
                      </div>
                      <div className="text-[1.05rem] font-semibold text-slate-900 group-hover:opacity-90 transition">
                        My CAS Journey
                      </div>
                    </div>
                  </Link>

                  {/* Links */}
                  <div className="hidden md:flex items-center gap-1">
                    <NavLink href="/">Dashboard</NavLink>
                    <NavLink href="/creativity">Creativity</NavLink>
                    <NavLink href="/activity">Activity</NavLink>
                    <NavLink href="/service">Service</NavLink>
                    <NavLink href="/conversations">Conversations</NavLink>
                    <div className="mx-2 h-6 w-px bg-slate-200" />
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.9rem] text-slate-800 hover:shadow-sm hover:bg-white transition"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Admin
                    </Link>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex items-center gap-2">
                    <Link
                      href="/admin"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
                    >
                      Admin
                    </Link>
                  </div>
                </div>

                {/* subtle bottom glow line */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
            </div>
          </nav>

          {/* Main */}
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-8">
              <div className="rounded-[2rem] border border-black/5 bg-white/65 backdrop-blur-xl shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
                <div className="p-5 sm:p-7">{children}</div>
              </div>

              <footer className="mt-6 text-center text-xs text-slate-500">
                Built for a clean, presentable CAS portfolio.
              </footer>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
