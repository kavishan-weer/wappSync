import type { CSSProperties, ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";
import { AlertCircle } from "@untitledui/icons/AlertCircle";
import { ArrowRight } from "@untitledui/icons/ArrowRight";
import { BarChartSquare03 } from "@untitledui/icons/BarChartSquare03";
import { CheckCircle } from "@untitledui/icons/CheckCircle";
import { ClockCheck } from "@untitledui/icons/ClockCheck";
import { FileCheck02 } from "@untitledui/icons/FileCheck02";
import { HelpCircle } from "@untitledui/icons/HelpCircle";
import { Inbox01 } from "@untitledui/icons/Inbox01";
import { Menu01 } from "@untitledui/icons/Menu01";
import { MessageChatCircle } from "@untitledui/icons/MessageChatCircle";
import { PackageCheck } from "@untitledui/icons/PackageCheck";
import { PlayCircle } from "@untitledui/icons/PlayCircle";
import { ShieldTick } from "@untitledui/icons/ShieldTick";
import { ShoppingCart02 } from "@untitledui/icons/ShoppingCart02";
import { Star06 } from "@untitledui/icons/Star06";
import { UploadCloud02 } from "@untitledui/icons/UploadCloud02";
import { ZapFast } from "@untitledui/icons/ZapFast";

import { LandingAnimations } from "./landing-animations";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

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

const heroStats = [
  { value: 78, suffix: "%", label: "common questions handled" },
  { value: 12, suffix: " min", label: "saved per order" },
  { value: 4, suffix: "x", label: "faster first replies" },
];

const proofPoints = [
  "Built for WhatsApp-first sellers",
  "Uses your products and policies",
  "Escalates when answers are unclear",
];

const pains = [
  {
    title: "Buried customer chats",
    description: "Orders, questions, and follow-ups all compete in one inbox.",
    icon: Inbox01,
  },
  {
    title: "Repeated manual replies",
    description: "Price, stock, COD, delivery, and return questions eat your day.",
    icon: ClockCheck,
  },
  {
    title: "Risky AI guessing",
    description: "Generic bots can invent answers when shop data is missing.",
    icon: AlertCircle,
  },
];

const features = [
  {
    title: "AI WhatsApp replies",
    description: "Answer product, delivery, and policy questions from trusted shop data.",
    icon: MessageChatCircle,
  },
  {
    title: "Order capture",
    description: "Collect customer details, products, quantities, and delivery address.",
    icon: ShoppingCart02,
  },
  {
    title: "Product catalog",
    description: "Keep prices, stock, images, categories, and variants in one place.",
    icon: PackageCheck,
  },
  {
    title: "Policy knowledge",
    description: "Upload FAQs and policy PDFs so the assistant can search them.",
    icon: FileCheck02,
  },
  {
    title: "Human escalation",
    description: "Pause automation and mark chats when the assistant is unsure.",
    icon: ShieldTick,
  },
  {
    title: "Simple dashboard",
    description: "Review conversations, orders, and attention-needed chats fast.",
    icon: BarChartSquare03,
  },
];

const workflow = [
  {
    title: "Add shop data",
    description: "Products, prices, stock, and policy documents become the assistant's source of truth.",
  },
  {
    title: "Connect WhatsApp",
    description: "Route customer messages from your WhatsApp Business number into Wappsync.",
  },
  {
    title: "Automate replies",
    description: "AI answers common questions, checks product data, and starts order capture.",
  },
  {
    title: "Step in only when needed",
    description: "Unclear conversations are flagged, paused, and ready for owner review.",
  },
];

const dashboardRows = [
  ["Nimali Fernando", "Medium floral dress", "AI collecting address", "green"],
  ["Ayesha Perera", "COD delivery question", "AI replied", "blue"],
  ["Ruwan Silva", "Return policy edge case", "Needs attention", "yellow"],
];

const faqs = [
  [
    "Does Wappsync replace WhatsApp?",
    "No. It connects to WhatsApp Business and gives your shop an AI-powered dashboard inbox.",
  ],
  [
    "Can AI answer product questions?",
    "Yes. Product prices, stock, and variants come from your structured catalog, not guesses.",
  ],
  [
    "What happens when the AI is unsure?",
    "The chat is paused, marked as Needs attention, and prepared for the owner to take over.",
  ],
  [
    "Can customers place orders in WhatsApp?",
    "Yes. The assistant can collect order details and create orders in the dashboard flow.",
  ],
  ["Do I need Shopify?", "No. The MVP is designed for shops that manage products directly in Wappsync."],
  [
    "Are payments included?",
    "Not in the MVP. Wappsync focuses on conversations, orders, stock, and escalation.",
  ],
];

function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30"
    >
      <span className="relative flex size-11 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white shadow-[0_14px_30px_rgba(37,211,102,0.28)] transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
        <span className="absolute right-2 top-2 size-2 rounded-full bg-white" />
        <MessageChatCircle className="size-6" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading text-xl font-bold tracking-normal ${
            inverse ? "text-white" : "text-[var(--text-primary)]"
          }`}
        >
          wappSync
        </span>
        <span className="mt-1 h-1 w-14 rounded-full bg-[var(--brand-primary)]" />
      </span>
    </Link>
  );
}

function LandingButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-[var(--brand-primary)] text-white shadow-[0_16px_34px_rgba(37,211,102,0.28)] hover:bg-[var(--brand-primary-hover)]",
    secondary:
      "border border-[var(--border-strong)] bg-white text-[var(--text-primary)] shadow-[0_12px_30px_rgba(17,27,33,0.07)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)]",
    ghost:
      "text-[var(--text-primary)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-primary-hover)]",
  };

  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/30 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

function Badge({ children, icon: Icon }: { children: ReactNode; icon?: Icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] shadow-[0_10px_26px_rgba(17,27,33,0.05)]">
      {Icon ? <Icon className="size-4 text-[var(--brand-primary-hover)]" /> : null}
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}
      data-animate="section"
    >
      <p className="mb-3 text-sm font-bold uppercase tracking-normal text-[var(--brand-primary-hover)]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold leading-tight tracking-normal text-[var(--text-primary)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-20 sm:px-8 lg:px-10 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: Icon;
  title: string;
  description: string;
}) {
  return (
    <article
      className="group rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_20px_46px_rgba(17,27,33,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-primary)]"
      data-animate="card"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--brand-pale)] text-[var(--brand-primary-hover)] transition-colors group-hover:bg-[var(--brand-primary)] group-hover:text-white">
        <Icon className="size-6" />
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
  label,
  text,
  outgoing = false,
}: {
  label: string;
  text: string;
  outgoing?: boolean;
}) {
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-3xl px-4 py-3 shadow-[0_10px_22px_rgba(17,27,33,0.08)] ${
          outgoing
            ? "rounded-br-md bg-[var(--chat-outgoing)]"
            : "rounded-bl-md bg-white"
        }`}
      >
        <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-primary)]">{text}</p>
      </div>
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-white/90 shadow-[0_14px_42px_rgba(17,27,33,0.06)] backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <BrandLogo />

        <div className="hidden items-center gap-1 rounded-full border border-[var(--border-soft)] bg-white p-1 shadow-[0_10px_28px_rgba(17,27,33,0.05)] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--brand-primary)]/25"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LandingButton href="/login" variant="ghost" className="hidden h-11 px-4 sm:inline-flex">
            Log in
          </LandingButton>
          <LandingButton href="/signup" className="h-11 px-4 sm:px-5">
            Get started
          </LandingButton>
          <details className="relative md:hidden">
            <summary
              aria-label="Open navigation menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-[var(--text-primary)] shadow-[0_8px_22px_rgba(17,27,33,0.06)] transition-colors hover:bg-[var(--brand-soft)] [&::-webkit-details-marker]:hidden"
            >
              <Menu01 className="size-5" />
            </summary>
            <div className="absolute right-0 mt-3 w-60 rounded-lg border border-[var(--border-soft)] bg-white p-2 shadow-[0_20px_50px_rgba(17,27,33,0.14)]">
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--brand-soft)] hover:text-[var(--text-primary)]"
              >
                Log in
              </Link>
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
                <PlayCircle className="size-4 text-[var(--brand-primary-hover)]" />
                View demo
              </Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

function HeroMockup() {
  return (
    <div className="relative min-h-[560px]" data-animate="hero-visual">
      <div className="absolute left-0 top-10 w-[82%] max-w-[520px] rounded-lg border border-[var(--border-soft)] bg-white p-4 shadow-[0_34px_90px_rgba(17,27,33,0.16)]">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border-soft)] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[var(--text-primary)] text-white">
              <Inbox01 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                Today&apos;s conversations
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                AI online and watching stock
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-hover)]">
            Live
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["28", "Chats"],
            ["12", "Orders"],
            ["4", "Need owner"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-lg border border-[var(--border-soft)] bg-[var(--brand-pale)] p-3"
            >
              <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {dashboardRows.map(([name, message, status, tone]) => (
            <div
              key={name}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[var(--border-soft)] p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                  {name}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">{message}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                  tone === "yellow"
                    ? "bg-[var(--accent-yellow)] text-[var(--text-primary)]"
                    : tone === "blue"
                      ? "bg-[#EAF7FD] text-[#237FA5]"
                      : "bg-[var(--brand-soft)] text-[var(--brand-primary-hover)]"
                }`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-0 w-[78%] max-w-[420px] rounded-lg border border-[var(--border-soft)] bg-[var(--bg-secondary)] p-4 shadow-[0_34px_90px_rgba(17,27,33,0.18)]">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-white p-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white">
            <MessageChatCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Dress Studio</p>
            <p className="text-xs text-[var(--text-muted)]">AI replying now</p>
          </div>
        </div>
        <div className="space-y-3">
          <ChatBubble label="Customer" text="Hi, is the green dress available in medium?" />
          <ChatBubble
            label="AI"
            text="Yes. Medium is in stock. The price is Rs. 3,500."
            outgoing
          />
          <ChatBubble label="Customer" text="I want to order one." />
          <ChatBubble
            label="AI"
            text="Great. Please send your name and delivery address."
            outgoing
          />
        </div>
      </div>

      <div className="absolute right-4 top-0 hidden w-56 rounded-lg border border-[var(--border-soft)] bg-white p-4 shadow-[0_24px_60px_rgba(17,27,33,0.14)] sm:block">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <ZapFast className="size-4 text-[var(--brand-primary-hover)]" />
          Automation score
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
          <div className="h-full w-[82%] rounded-full bg-[var(--brand-primary)]" />
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
          22 customer replies handled before lunch.
        </p>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="overflow-hidden px-5 pb-14 pt-14 sm:px-8 lg:px-10 lg:pb-20 lg:pt-18">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div data-animate="hero-copy">
          <Badge icon={Star06}>WhatsApp automation for small online shops</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Turn WhatsApp chats into confirmed orders
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Wappsync answers repeat questions, checks product data, captures order
            details, and flags the chats that need your human touch.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LandingButton href="/signup" className="w-full sm:w-auto">
              Start free
              <ArrowRight className="size-4" />
            </LandingButton>
            <LandingButton href="#dashboard-preview" variant="secondary" className="w-full sm:w-auto">
              <PlayCircle className="size-4 text-[var(--brand-primary-hover)]" />
              View demo
            </LandingButton>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {proofPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-pale)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)]"
              >
                <CheckCircle className="size-4 text-[var(--brand-primary-hover)]" />
                {point}
              </span>
            ))}
          </div>
        </div>
        <HeroMockup />
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-7xl gap-4 sm:grid-cols-3">
        {heroStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-[var(--border-soft)] bg-white p-5 shadow-[0_16px_42px_rgba(17,27,33,0.05)]"
            data-animate="stat"
          >
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              <span data-count={stat.value}>0</span>
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PainSection() {
  return (
    <Section className="bg-[var(--bg-secondary)]">
      <SectionHeader
        eyebrow="Why shops switch"
        title="WhatsApp selling is powerful, but the busywork piles up"
        description="Wappsync keeps the familiar customer channel while giving owners the structure they need behind the scenes."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {pains.map((pain) => (
          <FeatureCard key={pain.title} {...pain} />
        ))}
      </div>
    </Section>
  );
}

function FeatureSection() {
  return (
    <Section id="features">
      <SectionHeader
        eyebrow="Features"
        title="Built around the real shop workflow"
        description="Every surface is designed for product answers, order capture, escalation, and fast owner review."
        center
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </Section>
  );
}

function WorkflowSection() {
  return (
    <Section id="how-it-works" className="bg-[var(--brand-pale)]">
      <SectionHeader
        eyebrow="How it works"
        title="From setup to automated selling in four practical steps"
      />
      <div className="grid gap-4 lg:grid-cols-4">
        {workflow.map((step, index) => (
          <article
            key={step.title}
            className="rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_45px_rgba(17,27,33,0.06)]"
            data-animate="card"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[var(--text-primary)] text-base font-bold text-white">
              {index + 1}
            </div>
            <h3 className="text-lg font-bold leading-tight text-[var(--text-primary)]">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function DashboardPreview() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white shadow-[0_30px_80px_rgba(17,27,33,0.12)]"
      data-animate="showcase"
    >
      <div className="grid min-h-[620px] lg:grid-cols-[220px_minmax(240px,300px)_minmax(0,1fr)_280px]">
        <aside className="border-b border-[var(--border-soft)] bg-[var(--text-primary)] p-5 text-white lg:border-b-0 lg:border-r">
          <BrandLogo inverse />
          <div className="mt-8 space-y-2">
            {[
              [Inbox01, "Inbox"],
              [PackageCheck, "Products"],
              [ShoppingCart02, "Orders"],
              [UploadCloud02, "Knowledge"],
            ].map(([Icon, label]) => {
              const NavIcon = Icon as Icon;

              return (
                <div
                  key={label as string}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                    label === "Inbox"
                      ? "bg-white text-[var(--text-primary)]"
                      : "text-white/72"
                  }`}
                >
                  <NavIcon className="size-4" />
                  {label as string}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="border-b border-[var(--border-soft)] bg-[var(--bg-secondary)] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Inbox</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
              28 chats
            </span>
          </div>
          <div className="space-y-3">
            {dashboardRows.map(([name, message, badge, tone]) => (
              <div
                key={name}
                className="rounded-lg border border-[var(--border-soft)] bg-white p-4"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--text-primary)]">
                      {name}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                      {message}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      tone === "yellow"
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

        <div className="min-w-0 bg-[var(--bg-secondary)] p-4">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-white p-4">
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--text-primary)]">
                Nimali Fernando
              </p>
              <p className="text-sm text-[var(--text-muted)]">Customer chat</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-primary-hover)]">
              AI active
            </span>
          </div>
          <div className="space-y-3">
            <ChatBubble label="Customer" text="Hi, is this dress available in medium?" />
            <ChatBubble
              label="AI"
              text="Yes. Medium is available and the price is Rs. 3,500."
              outgoing
            />
            <ChatBubble label="Customer" text="Great. I want one." />
            <ChatBubble
              label="AI"
              text="Sure. Please send your name and delivery address."
              outgoing
            />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-3">
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-muted)]">
              Reply to customer
            </span>
            <span className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white">
              Send
            </span>
          </div>
        </div>

        <aside className="border-t border-[var(--border-soft)] bg-white p-5 lg:border-l lg:border-t-0">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Order panel</h3>
          <div className="mt-5 space-y-4">
            {[
              ["Customer", "Nimali Fernando"],
              ["Product", "Floral dress - Medium"],
              ["Status", "Awaiting address"],
              ["Stock", "8 available"],
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

function ShowcaseSection() {
  return (
    <Section id="dashboard-preview" className="bg-[var(--bg-secondary)]">
      <SectionHeader
        eyebrow="Dashboard"
        title="A calm command center for busy WhatsApp sellers"
        description="The owner sees which chats are handled, which orders are forming, and where human attention is needed."
      />
      <DashboardPreview />
    </Section>
  );
}

function PricingSection() {
  return (
    <Section id="pricing">
      <SectionHeader
        eyebrow="Pricing"
        title="Start simple, prove the workflow, then scale"
        description="The MVP is intentionally focused on the tools a small shop needs first."
        center
      />
      <div
        className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]"
        data-animate="section"
      >
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--text-primary)] p-8 text-white shadow-[0_28px_70px_rgba(17,27,33,0.16)]">
          <Badge icon={ZapFast}>Early access</Badge>
          <h3 className="mt-6 text-3xl font-bold leading-tight">
            Built for shops ready to automate replies now
          </h3>
          <p className="mt-4 text-base leading-7 text-white/72">
            Start with the core assistant, dashboard inbox, products, orders,
            policy uploads, and escalation flow.
          </p>
          <LandingButton href="/signup" className="mt-8 w-full">
            Start free
            <ArrowRight className="size-4" />
          </LandingButton>
        </div>
        <div className="rounded-lg border border-[var(--border-soft)] bg-white p-8 shadow-[0_24px_60px_rgba(17,27,33,0.08)]">
          <p className="text-sm font-bold uppercase tracking-normal text-[var(--brand-primary-hover)]">
            Included in starter
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "AI auto replies",
              "Dashboard inbox",
              "Product catalog",
              "Order tracking",
              "Policy uploads",
              "Human escalation",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="size-5 shrink-0 text-[var(--brand-primary-hover)]" />
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  {item}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-lg bg-[var(--bg-secondary)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
            WhatsApp messaging charges may apply based on Meta&apos;s pricing.
            Payment integrations are intentionally outside the MVP.
          </p>
        </div>
      </div>
    </Section>
  );
}

function FaqSection() {
  return (
    <Section id="faq" className="bg-[var(--brand-pale)]">
      <SectionHeader
        eyebrow="FAQ"
        title="Questions online shop owners ask before trying automation"
        center
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <article
            key={question}
            className="rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_16px_38px_rgba(17,27,33,0.05)]"
            data-animate="card"
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
  );
}

function FinalCta() {
  return (
    <section className="bg-[var(--text-primary)] px-5 py-20 text-white sm:px-8 lg:px-10">
      <div
        className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"
        data-animate="section"
      >
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-normal text-[var(--brand-primary)]">
            Ready when your inbox is
          </p>
          <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-normal sm:text-4xl">
            Give your WhatsApp shop an assistant that knows when to stop and ask you.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">
            Keep the speed of AI, the accuracy of your shop data, and the control
            of a human owner.
          </p>
        </div>
        <LandingButton href="/signup" className="w-full lg:w-auto">
          Get started
          <ArrowRight className="size-4" />
        </LandingButton>
      </div>
    </section>
  );
}

function LandingFooter() {
  const footerLinks = [
    ["Features", "#features"],
    ["How it works", "#how-it-works"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
    ["Login", "/login"],
  ];

  return (
    <footer className="border-t border-[var(--border-soft)] bg-white px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            Built for WhatsApp-first online shops that need faster replies,
            cleaner orders, and smarter escalation.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--text-secondary)]">
          {footerLinks.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[var(--text-primary)]">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white" style={pageStyle}>
      <LandingAnimations />
      <LandingHeader />
      <HeroSection />
      <PainSection />
      <FeatureSection />
      <WorkflowSection />
      <ShowcaseSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
