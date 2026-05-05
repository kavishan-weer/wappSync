import type { CSSProperties } from "react";
import Link from "next/link";
import { Menu, MessageCircle, Play } from "lucide-react";

const navLinks = ["Features", "How it works", "Pricing", "FAQ"];

const brandStyle = {
  "--brand-primary": "#25D366",
  "--brand-primary-hover": "#1DA851",
  "--brand-soft": "#E6F9F0",
  "--text-primary": "#111B21",
  "--text-secondary": "#667781",
  "--border-soft": "#E0E6EA",
} as CSSProperties;

export default function Home() {
  return (
    <main className="min-h-screen bg-white" style={brandStyle}>
      <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-white/90 shadow-[0_18px_50px_rgba(17,27,33,0.07)] backdrop-blur-xl">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        >
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30"
          >
            <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white shadow-[0_14px_30px_rgba(37,211,102,0.32)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-[var(--brand-soft)]" />
              <MessageCircle className="size-6" strokeWidth={2.6} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-normal text-[var(--text-primary)]">
                wappSync
              </span>
              <span className="mt-1 h-1 w-14 rounded-full bg-[var(--brand-primary)]" />
            </span>
          </Link>

          <div className="hidden items-center rounded-full border border-[var(--border-soft)] bg-white px-2 py-1 shadow-[0_12px_36px_rgba(17,27,33,0.06)] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25"
              >
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="#demo"
              className="hidden h-11 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-white px-4 text-sm font-semibold text-[var(--text-primary)] shadow-[0_8px_24px_rgba(17,27,33,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25 sm:inline-flex"
            >
              <Play className="size-4 fill-[var(--brand-primary)] text-[var(--brand-primary)]" />
              View Demo
            </Link>
            <Link
              href="#get-started"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30"
            >
              Get Started
            </Link>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-[var(--text-primary)] shadow-[0_8px_24px_rgba(17,27,33,0.06)] transition-colors hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25 md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </header>
    </main>
  );
}
