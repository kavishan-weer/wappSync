import Link from "next/link";
import {
  FileText,
  Inbox,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Smartphone,
} from "lucide-react";

const navItems = [
  { label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "AI Knowledge", href: "/dashboard/documents", icon: FileText },
  { label: "WhatsApp", href: "/dashboard/settings/whatsapp", icon: Smartphone },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({
  children,
  active,
  shopName,
}: {
  children: React.ReactNode;
  active: "dashboard" | "inbox" | "products" | "orders" | "documents" | "settings" | "whatsapp";
  shopName?: string;
}) {
  return (
    <main className="min-h-screen bg-[#F0F2F5] text-[#111B21]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#E0E6EA] bg-white p-6 lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#25D366] text-white">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold">wappSync</p>
              <p className="max-w-36 truncate text-xs font-medium text-[#667781]">
                {shopName ?? "Owner dashboard"}
              </p>
            </div>
          </Link>

          <nav className="mt-8 space-y-2" aria-label="Dashboard navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              let isActive = false;
              
              if (active === "dashboard") {
                isActive = item.href === "/dashboard";
              } else if (active === "whatsapp") {
                isActive = item.href === "/dashboard/settings/whatsapp";
              } else {
                isActive = item.href === `/dashboard/${active}`;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#E6F9F0] text-[#1DA851]"
                      : "text-[#667781] hover:bg-[#F5F7F9] hover:text-[#111B21]"
                  }`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-6 sm:p-8 lg:p-10">{children}</section>
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
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-[#E0E6EA] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-normal text-[#1DA851]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667781]">
          {description}
        </p>
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </header>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.22)] transition hover:bg-[#1DA851]"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
    >
      {children}
    </Link>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="h-10 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.20)] transition hover:bg-[#1DA851]"
    >
      {children}
    </button>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-2 h-11 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20 ${
        props.className ?? ""
      }`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`mt-2 min-h-28 w-full rounded-lg border border-[#D1D7DB] bg-white px-4 py-3 text-sm text-[#111B21] outline-none transition focus:border-[#25D366] focus:ring-3 focus:ring-[#25D366]/20 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#111B21]">{label}</span>
      {children}
    </label>
  );
}
