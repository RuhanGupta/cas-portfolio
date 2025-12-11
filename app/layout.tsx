import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Top nav */}
          <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-400 via-sky-400 to-emerald-300 shadow-lg shadow-indigo-500/40" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    CAS Portfolio
                  </span>
                  <span className="text-sm font-semibold">
                    My CAS Journey
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-medium text-slate-300">
                <Link
                  href="/"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/creativity"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Creativity
                </Link>
                <Link
                  href="/activity"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Activity
                </Link>
                <Link
                  href="/service"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Service
                </Link>
                <Link
                  href="/conversations"
                  className="hover:text-indigo-300 transition-colors"
                >
                  Conversations
                </Link>

                <span className="ml-4 pl-4 border-l border-slate-700/60">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-[0.7rem] text-indigo-200 hover:bg-indigo-500/20 transition"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Admin Panel
                  </Link>
                </span>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
