import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  HelpCircle,
  HomeIcon,
  Inbox,
  Menu,
  MessageCircle,
  Package,
  Play,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Upload,
} from "lucide-react";

const pageStyle = {
  "--brand-primary": "#25D366",
  "--brand-primary-hover": "#1DA851",
  "--brand-soft": "#E6F9F0",
  "--brand-pale": "#F0FFF7",
  "--chat-outgoing": "#DCF8C6",
  "--bg-secondary": "#F0F2F5",
  "--bg-muted": "#E9ECEF",
  "--text-primary": "#111B21",
  "--text-secondary": "#667781",
  "--text-muted": "#8696A0",
  "--border-soft": "#E0E6EA",
  "--border-strong": "#D1D7DB",
  "--accent-blue": "#53BDEB",
  "--accent-yellow": "#FFE69A",
  "--accent-red": "#FF6B6B",
} as CSSProperties;

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const painPoints = [
  {
    title: "Repeating the same answers",
    description:
      "Customers keep asking about price, stock, delivery, and policies.",
    icon: MessageCircle,
  },
  {
    title: "Missed orders",
    description: "Messages get buried and orders are forgotten.",
    icon: AlertCircle,
  },
  {
    title: "Slow replies",
    description: "Customers leave when they do not get fast answers.",
    icon: Clock3,
  },
  {
    title: "Manual tracking",
    description:
      "Owners use notebooks, chats, or spreadsheets to manage orders.",
    icon: FileText,
  },
];

const solutions = [
  {
    title: "AI replies automatically",
    description: "Answers product and policy questions using your shop data.",
    icon: Bot,
  },
  {
    title: "Creates orders",
    description: "Collects customer name, phone, address, product, and quantity.",
    icon: ShoppingCart,
  },
  {
    title: "Checks order status",
    description: "Customers can ask for updates directly in WhatsApp.",
    icon: CheckCircle2,
  },
  {
    title: "Escalates when unsure",
    description: "Marks chats as Needs attention and alerts the owner.",
    icon: ShieldCheck,
  },
];

const features = [
  {
    title: "WhatsApp Inbox",
    description: "Manage all customer chats from one dashboard.",
    icon: MessageCircle,
  },
  {
    title: "AI Auto Replies",
    description: "Reply instantly to common questions.",
    icon: Bot,
  },
  {
    title: "Product Catalog",
    description: "Add products, prices, stock, and images.",
    icon: Package,
  },
  {
    title: "Order Management",
    description: "Create and track orders from chats.",
    icon: ShoppingCart,
  },
  {
    title: "Policy Knowledge",
    description: "Upload FAQs and policies for AI answers.",
    icon: FileText,
  },
  {
    title: "Human Escalation",
    description: "AI pauses and alerts you when unsure.",
    icon: AlertCircle,
  },
];

const steps = [
  {
    title: "Add your products",
    description: "Add product names, prices, stock, and images.",
  },
  {
    title: "Upload your policies",
    description: "Upload return, delivery, and FAQ documents.",
  },
  {
    title: "Connect WhatsApp",
    description: "Connect your WhatsApp Business number using Meta setup.",
  },
  {
    title: "Let AI handle chats",
    description: "AI replies, collects details, and creates orders.",
  },
  {
    title: "Step in when needed",
    description: "Handle only chats marked as Needs attention.",
  },
];

const knowledgePoints = [
  {
    title: "Product data",
    description: "Prices, stock, images, and variants come from catalog.",
    icon: Package,
  },
  {
    title: "Policy documents",
    description: "FAQs, delivery rules, and return policies are searched.",
    icon: Upload,
  },
  {
    title: "No guessing",
    description: "Missing or unclear answers are escalated to owner.",
    icon: ShieldCheck,
  },
];

const userTypes = [
  ["Clothing sellers", "Dresses, sarees, shoes, accessories"],
  ["Beauty shops", "Cosmetics, skincare, hair products"],
  ["Home businesses", "Cakes, crafts, handmade goods"],
  ["Resellers", "COD sellers, Instagram sellers, Facebook sellers"],
];

const faqs = [
  [
    "Does this replace WhatsApp?",
    "It connects to WhatsApp Business API and gives you a dashboard inbox.",
  ],
  [
    "Can AI answer product questions?",
    "Yes, using your product catalog and uploaded policies.",
  ],
  [
    "What happens if AI is unsure?",
    "The chat is marked as Needs attention and the owner is alerted.",
  ],
  [
    "Can it create orders?",
    "Yes, it collects customer details and creates orders in the dashboard.",
  ],
  ["Do I need Shopify?", "No. Products can be added manually."],
  ["Is payment integration included?", "No, payments are out of scope for MVP."],
];

function BrandLogo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30"
    >
      <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white shadow-[0_14px_30px_rgba(37,211,102,0.32)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-[var(--brand-soft)]" />
        <MessageCircle className="size-6" strokeWidth={2.6} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-bold font-heading tracking-normal text-[var(--text-primary)]">
          wappSync
        </span>
        <span className="mt-1 h-1 w-14 rounded-full bg-[var(--brand-primary)]" />
      </span>
    </Link>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 lg:px-10 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-normal text-[var(--brand-primary-hover)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold leading-tight tracking-normal text-[var(--text-primary)] sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: typeof MessageCircle;
  title: string;
  description: string;
}) {
  const Icon = icon;

  return (
    <article className="rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)] transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-bold leading-tight tracking-normal text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </article>
  );
}

function ChatBubble({
  sender,
  text,
  outgoing = false,
}: {
  sender: string;
  text: string;
  outgoing?: boolean;
}) {
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-[0_8px_18px_rgba(17,27,33,0.08)] ${
          outgoing
            ? "rounded-br-md bg-[var(--chat-outgoing)]"
            : "rounded-bl-md bg-white"
        }`}
      >
        <p className="text-xs font-bold text-[var(--text-muted)]">{sender}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">
          {text}
        </p>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div id="demo" className="relative">
      <div className="absolute -left-6 top-8 hidden h-32 w-32 rounded-full bg-[var(--brand-soft)] blur-2xl lg:block" />
      <div className="relative grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-secondary)] p-4 shadow-[0_24px_60px_rgba(17,27,33,0.1)]">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-white p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Dress Studio
              </p>
              <p className="text-xs text-[var(--text-muted)]">AI online</p>
            </div>
          </div>
          <div className="space-y-3">
            <ChatBubble
              sender="Customer"
              text="Hi, is this dress available in medium?"
            />
            <ChatBubble
              sender="AI"
              text="Yes, it is available in medium. The price is Rs. 3,500."
              outgoing
            />
            <ChatBubble sender="Customer" text="I want to order." />
            <ChatBubble
              sender="AI"
              text="Sure. Please send your name and delivery address."
              outgoing
            />
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-soft)] bg-white p-4 shadow-[0_24px_60px_rgba(17,27,33,0.1)]">
          <div className="mb-4 flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Today&apos;s dashboard
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Orders and chats in one place
              </p>
            </div>
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-hover)]">
              AI handled
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["28", "Chats"],
              ["12", "Orders"],
              ["4", "Need attention"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border-soft)] bg-[var(--brand-pale)] p-4"
              >
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {value}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {[
              ["Nimali", "Medium dress order", "Confirmed"],
              ["Ayesha", "Delivery question", "AI replied"],
              ["Ruwan", "Return policy", "Needs attention"],
            ].map(([name, message, status]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] p-3"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{message}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    status === "Needs attention"
                      ? "bg-[var(--accent-yellow)] text-[var(--text-primary)]"
                      : "bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white shadow-[0_30px_80px_rgba(17,27,33,0.12)]">
      <div className="grid min-h-[620px] lg:grid-cols-[220px_300px_1fr_280px]">
        <aside className="border-b border-[var(--border-soft)] bg-[var(--text-primary)] p-5 text-white lg:border-b-0 lg:border-r">
          <BrandLogo />
          <div className="mt-8 space-y-2">
            {[
              [Inbox, "Inbox"],
              [Package, "Products"],
              [ShoppingCart, "Orders"],
              [Settings, "Settings"],
            ].map(([Icon, label]) => (
              <div
                key={label as string}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                  label === "Inbox"
                    ? "bg-white text-[var(--text-primary)]"
                    : "text-white/75"
                }`}
              >
                <Icon className="size-4" />
                {label as string}
              </div>
            ))}
          </div>
        </aside>

        <div className="border-b border-[var(--border-soft)] bg-[var(--bg-secondary)] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Inbox
            </h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
              28 chats
            </span>
          </div>
          <div className="space-y-3">
            {[
              ["Nimali", "Can I order medium?", "AI replied"],
              ["Ruwan", "Need delivery help", "Needs attention"],
              ["Ayesha", "Do you have COD?", "AI replied"],
              ["Kasun", "Order status please", "Open"],
            ].map(([name, message, badge]) => (
              <div
                key={name}
                className="rounded-lg border border-[var(--border-soft)] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">
                      {name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {message}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      badge === "Needs attention"
                        ? "bg-[var(--accent-yellow)] text-[var(--text-primary)]"
                        : "bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]"
                    }`}
                  >
                    {badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] p-4">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-4">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Nimali Fernando
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Customer chat
              </p>
            </div>
            <span className="rounded-full border border-[var(--brand-primary)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-hover)]">
              AI badge
            </span>
          </div>
          <div className="space-y-3">
            <ChatBubble
              sender="Customer"
              text="Hi, is this dress available in medium?"
            />
            <ChatBubble
              sender="AI"
              text="Yes, it is available in medium. The price is Rs. 3,500."
              outgoing
            />
            <ChatBubble sender="Customer" text="Great. I want one." />
            <ChatBubble
              sender="AI"
              text="Sure. Please send your name and delivery address."
              outgoing
            />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-3">
            <span className="flex-1 text-sm text-[var(--text-muted)]">
              Reply to customer
            </span>
            <button
              type="button"
              className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white"
            >
              Send
            </button>
          </div>
        </div>

        <aside className="border-t border-[var(--border-soft)] bg-white p-5 lg:border-l lg:border-t-0">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Order panel
          </h3>
          <div className="mt-5 space-y-4">
            {[
              ["Customer", "Nimali Fernando"],
              ["Product", "Floral dress - Medium"],
              ["Status", "Awaiting address"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[var(--bg-secondary)] p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-[var(--text-muted)]">
                  {label}
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white" style={pageStyle}>
      <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-white/90 shadow-[0_18px_50px_rgba(17,27,33,0.07)] backdrop-blur-xl">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        >
          <BrandLogo />

          <div className="hidden items-center rounded-full border border-[var(--border-soft)] bg-white px-2 py-1 shadow-[0_12px_36px_rgba(17,27,33,0.06)] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="#dashboard-preview"
              className="hidden h-11 items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-white px-4 text-sm font-semibold text-[var(--text-primary)] shadow-[0_8px_24px_rgba(17,27,33,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25 sm:inline-flex"
            >
              <Play className="size-4 fill-[var(--brand-primary)] text-[var(--brand-primary)]" />
              View Demo
            </Link>
            <Link
              href="#pricing"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand-primary)] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(37,211,102,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30"
            >
              Get Started
            </Link>
            <details className="relative md:hidden">
              <summary
                aria-label="Open navigation menu"
                className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-[var(--text-primary)] shadow-[0_8px_24px_rgba(17,27,33,0.06)] transition-colors hover:bg-[var(--brand-soft)] [&::-webkit-details-marker]:hidden"
              >
                <Menu className="size-5" />
              </summary>
              <div className="absolute right-0 mt-3 w-56 rounded-lg border border-[var(--border-soft)] bg-white p-2 shadow-[0_20px_50px_rgba(17,27,33,0.14)]">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--brand-soft)] hover:text-[var(--text-primary)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="#dashboard-preview"
                  className="mt-1 flex items-center gap-2 rounded-lg border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-soft)]"
                >
                  <Play className="size-4 fill-[var(--brand-primary)] text-[var(--brand-primary)]" />
                  View Demo
                </Link>
              </div>
            </details>
          </div>
        </nav>
      </header>

      <section className="px-5 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--brand-pale)] px-4 py-2 text-sm font-bold text-[var(--brand-primary-hover)]">
              <Sparkles className="size-4" />
              Built for WhatsApp-first online shops
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Automate WhatsApp orders for your online shop
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Answer customer questions, collect order details, check stock, and
              manage chats from one simple AI-powered dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 text-base font-bold text-white shadow-[0_16px_32px_rgba(37,211,102,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-primary-hover)]"
              >
                Start Free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-white px-6 text-base font-bold text-[var(--text-primary)] shadow-[0_10px_28px_rgba(17,27,33,0.06)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-soft)]"
              >
                See How It Works
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm font-semibold text-[var(--text-secondary)]">
              Built for small online shops that sell through WhatsApp.
            </p>
          </div>
          <HeroVisual />
        </div>
      </section>

      <Section
        eyebrow="Problem"
        title="Selling on WhatsApp should not take your whole day"
        className="bg-[var(--bg-secondary)]"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point) => (
            <InfoCard key={point.title} {...point} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Solution"
        title="Your WhatsApp assistant handles the repetitive work"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution) => (
            <InfoCard key={solution.title} {...solution} />
          ))}
        </div>
      </Section>

      <Section
        id="features"
        eyebrow="Features"
        title="Everything small shops need to reply, sell, and track"
        className="bg-[var(--brand-pale)]"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <InfoCard key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="Process" title="How it works">
        <div className="grid gap-4 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]"
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-full bg-[var(--brand-primary)] text-base font-bold text-white">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="dashboard-preview"
        eyebrow="Dashboard"
        title="Everything in one simple dashboard"
        className="bg-[var(--bg-secondary)]"
      >
        <DashboardPreview />
      </Section>

      <Section
        eyebrow="AI Knowledge"
        title="AI answers using your shop information"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Upload your policies and FAQs, add your products, and the assistant
            uses that information to answer customers accurately. If it cannot
            find the right answer, it does not guess. It alerts you.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {knowledgePoints.map((point) => (
              <InfoCard key={point.title} {...point} />
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="For Shops"
        title="Built for online shops that sell through WhatsApp"
        className="bg-[var(--brand-pale)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {userTypes.map(([type, example]) => (
            <article
              key={type}
              className="flex items-start gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_38px_rgba(17,27,33,0.06)]"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]">
                <HomeIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {type}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {example}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Simple pricing for small shops">
        <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border-soft)] bg-white p-8 shadow-[0_28px_70px_rgba(17,27,33,0.12)]">
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[var(--brand-primary-hover)]">
                Starter
              </p>
              <h3 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                For small shops starting with WhatsApp automation
              </h3>
            </div>
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]">
              <Tag className="size-6" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              "AI replies",
              "Dashboard inbox",
              "Products",
              "Orders",
              "Policy upload",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check className="size-5 text-[var(--brand-primary-hover)]" />
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  {item}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="#get-started"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--brand-primary)] px-6 text-base font-bold text-white shadow-[0_16px_32px_rgba(37,211,102,0.3)] hover:bg-[var(--brand-primary-hover)]"
          >
            Join Early Access
          </Link>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            WhatsApp messaging charges may apply based on Meta&apos;s pricing.
          </p>
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Questions online shop owners ask">
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article
              key={question}
              className="rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_38px_rgba(17,27,33,0.06)]"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-1 size-5 shrink-0 text-[var(--brand-primary-hover)]" />
                <div>
                  <h3 className="font-bold leading-6 text-[var(--text-primary)]">
                    {question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {answer}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section id="get-started" className="bg-[var(--text-primary)] px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-normal sm:text-4xl">
              Turn WhatsApp chats into orders faster
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">
              Start with a simple AI assistant built for online shop owners.
            </p>
          </div>
          <Link
            href="#pricing"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-7 text-base font-bold text-white shadow-[0_16px_32px_rgba(37,211,102,0.28)] hover:bg-[var(--brand-primary-hover)]"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border-soft)] bg-white px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Built for WhatsApp-first online shops.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--text-secondary)]">
            {["Features", "Pricing", "FAQ", "Contact", "Privacy Policy", "Terms"].map(
              (link) => (
                <Link
                  key={link}
                  href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
                  className="hover:text-[var(--text-primary)]"
                >
                  {link}
                </Link>
              )
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
