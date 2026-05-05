import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  MessageCircle,
  PauseCircle,
  Phone,
  Search,
  XCircle,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireShop } from "@/lib/auth/dashboard";
import type { Conversation, ConversationStatus, Message } from "@/lib/db/types";
import { ConversationControls, MessageThread, ReplyComposer } from "./inbox-client";

type FilterKey = "all" | "active" | "needs_attention" | "ai_paused";

const filters: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "active", label: "Active", icon: Clock },
  { key: "needs_attention", label: "Attention", icon: AlertTriangle },
  { key: "ai_paused", label: "AI Paused", icon: PauseCircle },
];

/* ── Status badge ────────────────────────────────────────────────── */

function statusBadge(status: ConversationStatus, automationPaused: boolean) {
  if (automationPaused) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE69A]/40 px-2 py-0.5 text-[10px] font-bold text-[#946800]">
        <PauseCircle className="size-2.5" /> Paused
      </span>
    );
  }

  switch (status) {
    case "needs_attention":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B6B]/10 px-2 py-0.5 text-[10px] font-bold text-[#B42318]">
          <AlertTriangle className="size-2.5" /> Attention
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F9F0] px-2 py-0.5 text-[10px] font-bold text-[#1DA851]">
          <CheckCircle2 className="size-2.5" /> Resolved
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F2F5] px-2 py-0.5 text-[10px] font-bold text-[#667781]">
          <XCircle className="size-2.5" /> Closed
        </span>
      );
    default:
      return null;
  }
}

/* ── Avatar ──────────────────────────────────────────────────────── */

function ContactAvatar({ name, isSelected }: { name: string; isSelected: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
        isSelected
          ? "bg-[#25D366] text-white"
          : "bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 text-[#128C7E]"
      }`}
    >
      {initials || "?"}
    </div>
  );
}

/* ── Time formatter ──────────────────────────────────────────────── */

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ── Main Page ───────────────────────────────────────────────────── */

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; conversation?: string }>;
}) {
  const { supabase, shop } = await requireShop();
  const params = await searchParams;

  const currentFilter = (params.filter ?? "all") as FilterKey;
  const selectedConversationId = params.conversation ?? null;

  // Build conversation query based on filter
  let query = supabase
    .from("conversations")
    .select("*")
    .eq("shop_id", shop.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (currentFilter === "active") {
    query = query.eq("status", "active");
  } else if (currentFilter === "needs_attention") {
    query = query.eq("status", "needs_attention");
  } else if (currentFilter === "ai_paused") {
    query = query.eq("automation_paused", true);
  }

  const { data: conversations } = await query;
  const convos = (conversations ?? []) as Conversation[];

  // Count for badges
  const { count: attentionCount } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id)
    .eq("status", "needs_attention");

  // Load selected conversation messages
  let selectedConvo: Conversation | null = null;
  let messages: Message[] = [];

  if (selectedConversationId) {
    selectedConvo =
      convos.find((c) => c.id === selectedConversationId) ?? null;

    if (!selectedConvo) {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", selectedConversationId)
        .eq("shop_id", shop.id)
        .maybeSingle();
      selectedConvo = data as Conversation | null;
    }

    if (selectedConvo) {
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversationId)
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: true });
      messages = (msgData ?? []) as Message[];
    }
  }

  return (
    <DashboardShell active="inbox" shopName={shop.name}>
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-[#E0E6EA] bg-white shadow-[0_24px_80px_rgba(17,27,33,0.12)]"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="grid h-full overflow-hidden lg:grid-cols-[380px_1fr]">
          {/* ── Conversation sidebar ──────────────────────────── */}
          <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-[#E0E6EA]">
            {/* Header */}
            <div className="bg-[#F0F2F5] p-4 pb-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#111B21]">Inbox</h1>
                {(attentionCount ?? 0) > 0 && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#FF6B6B] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(255,107,107,0.4)]">
                    {attentionCount}
                  </span>
                )}
              </div>

              {/* Search bar (visual only for now) */}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-[0_1px_3px_rgba(17,27,33,0.06)]">
                <Search className="size-4 text-[#8696A0]" />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  className="flex-1 bg-transparent text-sm text-[#111B21] outline-none placeholder:text-[#8696A0]"
                  disabled
                />
              </div>

              {/* Filters */}
              <div className="mt-3 flex gap-1">
                {filters.map((f) => {
                  const Icon = f.icon;
                  const isActive = currentFilter === f.key;

                  return (
                    <Link
                      key={f.key}
                      href={`/dashboard/inbox?filter=${f.key}`}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#25D366] text-white shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
                          : "bg-white text-[#667781] shadow-[0_1px_3px_rgba(17,27,33,0.06)] hover:bg-[#E9ECEF] hover:text-[#111B21]"
                      }`}
                    >
                      <Icon className="size-3" />
                      {f.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {convos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#F0F2F5]">
                    <Inbox className="size-7 text-[#8696A0]" />
                  </div>
                  <p className="mt-5 text-sm font-bold text-[#111B21]">
                    No conversations yet
                  </p>
                  <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-[#667781]">
                    When customers message you on WhatsApp, their chats will appear here.
                  </p>
                </div>
              ) : (
                convos.map((convo) => {
                  const isSelected = convo.id === selectedConversationId;
                  const displayName =
                    convo.customer_name ?? convo.customer_phone;

                  return (
                    <Link
                      key={convo.id}
                      href={`/dashboard/inbox?filter=${currentFilter}&conversation=${convo.id}`}
                      className={`flex items-center gap-3 border-b border-[#F0F2F5] px-4 py-3.5 transition ${
                        isSelected
                          ? "bg-[#F0F2F5]"
                          : "hover:bg-[#F5F7F9]"
                      }`}
                    >
                      <ContactAvatar
                        name={displayName}
                        isSelected={isSelected}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[14px] font-bold text-[#111B21]">
                            {displayName}
                          </p>
                          {convo.last_message_at && (
                            <span
                              className={`shrink-0 text-[11px] ${
                                convo.status === "needs_attention"
                                  ? "font-bold text-[#25D366]"
                                  : "text-[#667781]"
                              }`}
                            >
                              {formatTime(convo.last_message_at)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-[#667781]">
                            {convo.last_message_preview ?? convo.customer_phone}
                          </p>
                          {statusBadge(convo.status, convo.automation_paused)}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>

          {/* ── Chat view ─────────────────────────────────────── */}
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {selectedConvo ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-[#E0E6EA] bg-[#F0F2F5] px-5 py-3">
                  <div className="flex items-center gap-3">
                    <ContactAvatar
                      name={
                        selectedConvo.customer_name ??
                        selectedConvo.customer_phone
                      }
                      isSelected
                    />
                    <div>
                      <p className="text-sm font-bold text-[#111B21]">
                        {selectedConvo.customer_name ??
                          selectedConvo.customer_phone}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#667781]">
                        <Phone className="size-3" />
                        {selectedConvo.customer_phone}
                        {statusBadge(
                          selectedConvo.status,
                          selectedConvo.automation_paused,
                        )}
                      </div>
                    </div>
                  </div>
                  <ConversationControls
                    conversationId={selectedConvo.id}
                    automationPaused={selectedConvo.automation_paused}
                    status={selectedConvo.status}
                  />
                </div>

                {/* Messages */}
                <div
                  className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d8db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundColor: "#ECE5DD",
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rounded-xl bg-white/80 px-6 py-4 shadow-[0_2px_12px_rgba(17,27,33,0.1)] backdrop-blur">
                        <MessageCircle className="mx-auto size-8 text-[#25D366]" />
                        <p className="mt-2 text-sm font-bold text-[#111B21]">
                          No messages yet
                        </p>
                        <p className="mt-1 text-xs text-[#667781]">
                          Start the conversation by sending a message below.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MessageThread messages={messages} />
                  )}
                </div>

                {/* Reply composer */}
                <ReplyComposer
                  conversationId={selectedConvo.id}
                  customerPhone={selectedConvo.customer_phone}
                />
              </>
            ) : (
              /* Empty state */
              <div
                className="flex h-full flex-col items-center justify-center p-8 text-center"
                style={{ backgroundColor: "#F0F2F5" }}
              >
                <div className="max-w-md">
                  <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#E6F9F0] to-[#C8F5D8]">
                    <MessageCircle className="size-10 text-[#25D366]" />
                  </div>
                  <h2 className="mt-8 text-2xl font-bold text-[#41525D]">
                    wappSync Inbox
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#667781]">
                    Select a conversation from the sidebar to view messages, reply
                    to customers, and manage your WhatsApp chats — all in one place.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#667781] shadow-[0_2px_8px_rgba(17,27,33,0.06)]">
                    <span className="flex size-2 rounded-full bg-[#25D366] shadow-[0_0_6px_rgba(37,211,102,0.5)]" />
                    End-to-end encrypted
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
