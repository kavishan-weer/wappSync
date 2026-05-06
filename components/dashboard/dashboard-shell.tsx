import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";
import Link from "next/link";
import { BarChartSquare03 } from "@untitledui/icons/BarChartSquare03";
import { ChevronRight } from "@untitledui/icons/ChevronRight";
import { FileCheck02 } from "@untitledui/icons/FileCheck02";
import { Inbox01 } from "@untitledui/icons/Inbox01";
import { MessageChatCircle } from "@untitledui/icons/MessageChatCircle";
import { PackageCheck } from "@untitledui/icons/PackageCheck";
import { Settings02 } from "@untitledui/icons/Settings02";
import { ShoppingCart02 } from "@untitledui/icons/ShoppingCart02";
import { Phone01 } from "@untitledui/icons/Phone01";

import { cn } from "@/lib/utils";

import { DashboardAnimations } from "./dashboard-animations";

type DashboardIcon = ElementType<{ className?: string }>;

const dashboardStyle = {
  "--dashboard-bg": "#F0F2F5",
  "--dashboard-panel": "#FFFFFF",
  "--dashboard-muted": "#F5F7F9",
  "--dashboard-soft": "#E6F9F0",
  "--dashboard-text": "#111B21",
  "--dashboard-secondary": "#667781",
  "--dashboard-muted-text": "#8696A0",
  "--dashboard-border": "#E0E6EA",
  "--dashboard-strong-border": "#D1D7DB",
  "--dashboard-brand": "#25D366",
  "--dashboard-brand-hover": "#1DA851",
  "--dashboard-blue": "#53BDEB",
  "--dashboard-yellow": "#FFE69A",
  "--dashboard-red": "#FF6B6B",
} as CSSProperties;

const navItems: Array<{
  label: string;
  href: string;
  active: DashboardShellProps["active"];
  icon: DashboardIcon;
}> = [
  { label: "Overview", href: "/dashboard", active: "dashboard", icon: BarChartSquare03 },
  { label: "Inbox", href: "/dashboard/inbox", active: "inbox", icon: Inbox01 },
  { label: "Products", href: "/dashboard/products", active: "products", icon: PackageCheck },
  { label: "Orders", href: "/dashboard/orders", active: "orders", icon: ShoppingCart02 },
  { label: "AI Knowledge", href: "/dashboard/documents", active: "documents", icon: FileCheck02 },
  { label: "WhatsApp", href: "/dashboard/settings/whatsapp", active: "whatsapp", icon: Phone01 },
  { label: "Settings", href: "/dashboard/settings", active: "settings", icon: Settings02 },
];

type DashboardShellProps = {
  children: ReactNode;
  active:
    | "dashboard"
    | "inbox"
    | "products"
    | "orders"
    | "documents"
    | "settings"
    | "whatsapp";
  shopName?: string;
};

export function DashboardShell({ children, active, shopName }: DashboardShellProps) {
  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]"
      style={dashboardStyle}
    >
      <DashboardAnimations />
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--dashboard-border)] bg-white/95 p-5 shadow-[0_18px_55px_rgba(17,27,33,0.06)] backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/25"
            >
              <div className="relative flex size-11 items-center justify-center rounded-lg bg-[var(--dashboard-brand)] text-white shadow-[0_14px_30px_rgba(37,211,102,0.24)] transition-transform group-hover:-rotate-2 group-hover:scale-105">
                <span className="absolute right-2 top-2 size-2 rounded-full bg-white" />
                <MessageChatCircle className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-lg font-bold leading-none tracking-normal">
                  wappSync
                </p>
                <p className="mt-1 max-w-44 truncate text-xs font-semibold text-[var(--dashboard-secondary)]">
                  {shopName ?? "Owner dashboard"}
                </p>
              </div>
            </Link>

            <nav className="mt-8 space-y-1.5" aria-label="Dashboard navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.active === active;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/20",
                      isActive
                        ? "bg-[var(--dashboard-soft)] text-[var(--dashboard-brand-hover)] shadow-[inset_0_0_0_1px_rgba(37,211,102,0.14)]"
                        : "text-[var(--dashboard-secondary)] hover:bg-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg transition",
                          isActive
                            ? "bg-white text-[var(--dashboard-brand-hover)] shadow-sm"
                            : "bg-transparent text-[var(--dashboard-muted-text)] group-hover:bg-white",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </span>
                    {isActive ? <ChevronRight className="size-4 shrink-0" /> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto hidden rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-muted)] p-4 lg:block">
              <p className="text-sm font-bold text-[var(--dashboard-text)]">
                AI safety mode
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--dashboard-secondary)]">
                Product, stock, order, and customer data stay grounded in your shop records.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1500px] min-w-0 flex-col gap-6" data-dashboard-page>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header
      className="flex min-w-0 flex-col gap-4 rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_18px_45px_rgba(17,27,33,0.06)] sm:flex-row sm:items-center sm:justify-between lg:p-6"
      data-dashboard-animate
    >
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-normal text-[var(--dashboard-brand-hover)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-normal text-[var(--dashboard-text)] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dashboard-secondary)]">
          {description}
        </p>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </header>
  );
}

export function DashboardSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_16px_38px_rgba(17,27,33,0.05)] lg:p-6",
        className,
      )}
      data-dashboard-animate
    >
      {children}
    </section>
  );
}

export function DashboardCard({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "aside";
}) {
  return (
    <Component
      className={cn(
        "rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_16px_38px_rgba(17,27,33,0.05)]",
        className,
      )}
      data-dashboard-animate
    >
      {children}
    </Component>
  );
}

export function DashboardCardHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: DashboardIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-soft)] text-[var(--dashboard-brand-hover)]">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight text-[var(--dashboard-text)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[var(--dashboard-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  detail,
}: {
  label: string;
  value: string;
  icon: DashboardIcon;
  tone?: "green" | "blue" | "yellow" | "red" | "neutral";
  detail?: string;
}) {
  const toneClasses = {
    green: "bg-[var(--dashboard-soft)] text-[var(--dashboard-brand-hover)]",
    blue: "bg-[#EAF7FD] text-[#237FA5]",
    yellow: "bg-[var(--dashboard-yellow)]/45 text-[#946800]",
    red: "bg-[var(--dashboard-red)]/10 text-[#B42318]",
    neutral: "bg-[var(--dashboard-muted)] text-[var(--dashboard-secondary)]",
  };

  return (
    <article
      className="rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_14px_34px_rgba(17,27,33,0.05)]"
      data-dashboard-animate
    >
      <div className={cn("mb-4 flex size-11 items-center justify-center rounded-lg", toneClasses[tone])}>
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-[var(--dashboard-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--dashboard-text)]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[var(--dashboard-muted-text)]">{detail}</p> : null}
    </article>
  );
}

export function DashboardBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "green" | "blue" | "yellow" | "red" | "neutral";
  className?: string;
}) {
  const toneClasses = {
    green: "bg-[var(--dashboard-soft)] text-[var(--dashboard-brand-hover)]",
    blue: "bg-[#EAF7FD] text-[#237FA5]",
    yellow: "bg-[var(--dashboard-yellow)]/45 text-[#946800]",
    red: "bg-[var(--dashboard-red)]/10 text-[#B42318]",
    neutral: "bg-[var(--dashboard-muted)] text-[var(--dashboard-secondary)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: DashboardIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-dashed border-[var(--dashboard-strong-border)] bg-white p-10 text-center shadow-[0_14px_34px_rgba(17,27,33,0.04)]",
        className,
      )}
      data-dashboard-animate
    >
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--dashboard-muted)] text-[var(--dashboard-muted-text)]">
        <Icon className="size-8" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-[var(--dashboard-text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--dashboard-secondary)]">
        {description}
      </p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </section>
  );
}

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--dashboard-brand)] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.20)] transition hover:-translate-y-0.5 hover:bg-[var(--dashboard-brand-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/25",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--dashboard-strong-border)] bg-white px-4 text-sm font-bold text-[var(--dashboard-text)] transition hover:-translate-y-0.5 hover:bg-[var(--dashboard-muted)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/20",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--dashboard-brand)] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.20)] transition hover:-translate-y-0.5 hover:bg-[var(--dashboard-brand-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/25 disabled:cursor-not-allowed disabled:bg-[var(--dashboard-strong-border)] disabled:shadow-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--dashboard-strong-border)] bg-white px-4 text-sm font-bold text-[var(--dashboard-text)] transition hover:bg-[var(--dashboard-muted)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/20 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-[var(--dashboard-strong-border)] bg-white text-[var(--dashboard-secondary)] transition hover:bg-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--dashboard-brand)]/20",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mt-2 h-11 w-full min-w-0 rounded-lg border border-[var(--dashboard-strong-border)] bg-white px-4 text-sm text-[var(--dashboard-text)] outline-none transition placeholder:text-[var(--dashboard-muted-text)] focus:border-[var(--dashboard-brand)] focus:ring-3 focus:ring-[var(--dashboard-brand)]/20 disabled:cursor-not-allowed disabled:bg-[var(--dashboard-muted)] disabled:text-[var(--dashboard-muted-text)]",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "mt-2 min-h-28 w-full min-w-0 rounded-lg border border-[var(--dashboard-strong-border)] bg-white px-4 py-3 text-sm text-[var(--dashboard-text)] outline-none transition placeholder:text-[var(--dashboard-muted-text)] focus:border-[var(--dashboard-brand)] focus:ring-3 focus:ring-[var(--dashboard-brand)]/20 disabled:cursor-not-allowed disabled:bg-[var(--dashboard-muted)] disabled:text-[var(--dashboard-muted-text)]",
        props.className,
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "mt-2 h-11 w-full min-w-0 rounded-lg border border-[var(--dashboard-strong-border)] bg-white px-4 text-sm font-semibold text-[var(--dashboard-text)] outline-none transition focus:border-[var(--dashboard-brand)] focus:ring-3 focus:ring-[var(--dashboard-brand)]/20",
        props.className,
      )}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-semibold text-[var(--dashboard-text)]">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-[var(--dashboard-muted-text)]">{hint}</span> : null}
    </label>
  );
}

export function FormPanel({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: DashboardIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardHeader icon={icon} title={title} description={description} />
      <div className="mt-6 grid gap-5">{children}</div>
    </DashboardCard>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[var(--dashboard-border)] bg-white shadow-[0_14px_34px_rgba(17,27,33,0.05)]"
      data-dashboard-animate
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
