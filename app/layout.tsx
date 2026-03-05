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
      className="rounded-full border border-transparent px-3 py-1.5 text-[0.86rem] font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <nav className="sticky top-0 z-40 px-4 pt-4">
            <div className="mx-auto max-w-6xl rounded-[1.6rem] border border-white/12 bg-[#081126]/82 backdrop-blur-2xl shadow-[0_24px_70px_rgba(2,8,20,0.55)]">
              <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <Link href="/" className="group flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[conic-gradient(from_180deg,rgba(34,211,238,0.95),rgba(245,158,11,0.85),rgba(52,211,153,0.8),rgba(34,211,238,0.95))] shadow-[0_16px_36px_rgba(8,145,178,0.32)]" />
                  <div className="leading-tight">
                    <div className="text-[0.64rem] uppercase tracking-[0.24em] text-cyan-300/80">
                      CAS Portfolio
                    </div>
                    <div className="text-[1.03rem] font-semibold text-slate-100 group-hover:text-white">
                      Ruhan Gupta
                    </div>
                  </div>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                  <NavLink href="/">Dashboard</NavLink>
                  <NavLink href="/creativity">Creativity</NavLink>
                  <NavLink href="/activity">Activity</NavLink>
                  <NavLink href="/service">Service</NavLink>
                  <NavLink href="/conversations">Conversations</NavLink>
                  <div className="mx-2 h-6 w-px bg-white/12" />
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1.5 text-[0.86rem] font-medium text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    Admin
                  </Link>
                </div>

                <div className="md:hidden flex items-center gap-2">
                  <Link
                    href="/admin"
                    className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1.5 text-sm text-cyan-100"
                  >
                    Admin
                  </Link>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
            </div>
          </nav>

          <main className="mx-auto max-w-6xl px-4 pb-10 pt-8">
            <div className="panel animate-rise p-5 sm:p-7">
              {children}
            </div>

            <footer className="mt-6 text-center text-xs text-slate-400">
              Built for a polished, dark-mode CAS portfolio presentation.
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
