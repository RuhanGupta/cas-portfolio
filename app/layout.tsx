import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { JetBrains_Mono, Merriweather, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const fontSans = Merriweather({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const navItems = [
  { href: "/", label: "Home" },
  { href: "/creativity", label: "Creativity" },
  { href: "/activity", label: "Activity" },
  { href: "/service", label: "Service" },
  { href: "/conversations", label: "Conversations" },
];

export const metadata: Metadata = {
  title: "Ruhan Gupta | CAS Portfolio",
  description:
    "An editorial CAS portfolio documenting creativity, activity, service, and reflective conversations.",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="nav-chip">
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <div className="min-h-screen">
          <nav className="sticky top-0 z-40 px-4 pt-4">
            <div className="site-panel mx-auto max-w-6xl px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Link href="/" className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/12 shadow-sm">
                    <div className="h-8 w-8 rounded-full border border-primary/30 bg-primary/75" />
                  </div>
                  <div>
                    <p className="kicker">IB Diploma Programme</p>
                    <p className="font-serif text-2xl text-foreground">
                      Ruhan Gupta
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CAS portfolio in Kodama Grove
                    </p>
                  </div>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} />
                  ))}
                  <Link href="/admin" className="action-button">
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>

          <footer className="px-4 pb-10">
            <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-border/70 bg-popover/72 px-6 py-5 text-sm text-muted-foreground">
              <p className="font-serif text-xl text-foreground">
                A warmer, editorial CAS archive.
              </p>
              <p className="mt-2 max-w-3xl leading-7">
                Built with Next.js to document reflections, evidence, and
                conversations across creativity, activity, and service.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
