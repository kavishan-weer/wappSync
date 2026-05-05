"use client";

import { useRef, useState, useTransition } from "react";
import {
  Bot,
  Check,
  CheckCheck,
  Loader2,
  PauseCircle,
  PlayCircle,
  Send,
  User,
} from "lucide-react";

import { sendReply, toggleAutomation, updateConversationStatus } from "./actions";
import type { ConversationStatus, Message } from "@/lib/db/types";

/* ── Conversation Controls ──────────────────────────────────────── */

export function ConversationControls({
  conversationId,
  automationPaused,
  status,
}: {
  conversationId: string;
  automationPaused: boolean;
  status: ConversationStatus;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Pause / Resume automation */}
      <form action={toggleAutomation}>
        <input type="hidden" name="conversation_id" value={conversationId} />
        <input
          type="hidden"
          name="action"
          value={automationPaused ? "resume" : "pause"}
        />
        <button
          type="submit"
          title={automationPaused ? "Resume AI replies" : "Pause AI replies"}
          className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
            automationPaused
              ? "border-[#25D366]/30 bg-[#E6F9F0] text-[#1DA851] hover:bg-[#25D366]/20"
              : "border-[#FFE69A] bg-[#FFE69A]/30 text-[#946800] hover:bg-[#FFE69A]/50"
          }`}
        >
          {automationPaused ? (
            <PlayCircle className="size-4" />
          ) : (
            <PauseCircle className="size-4" />
          )}
        </button>
      </form>

      {/* Resolve / Reopen */}
      {status === "needs_attention" || status === "active" ? (
        <form action={updateConversationStatus}>
          <input type="hidden" name="conversation_id" value={conversationId} />
          <input type="hidden" name="status" value="resolved" />
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#25D366]/30 bg-[#E6F9F0] px-3.5 text-xs font-bold text-[#1DA851] transition hover:bg-[#25D366]/20"
          >
            <Check className="size-3.5" /> Resolve
          </button>
        </form>
      ) : null}

      {status === "resolved" || status === "closed" ? (
        <form action={updateConversationStatus}>
          <input type="hidden" name="conversation_id" value={conversationId} />
          <input type="hidden" name="status" value="active" />
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D1D7DB] bg-white px-3.5 text-xs font-bold text-[#111B21] transition hover:bg-[#F5F7F9]"
          >
            Reopen
          </button>
        </form>
      ) : null}
    </div>
  );
}

/* ── Message Thread ─────────────────────────────────────────────── */

function statusIcon(status: string) {
  switch (status) {
    case "read":
      return <CheckCheck className="size-3 text-[#53BDEB]" />;
    case "delivered":
      return <CheckCheck className="size-3 text-[#8696A0]" />;
    case "sent":
      return <Check className="size-3 text-[#8696A0]" />;
    default:
      return null;
  }
}

export function MessageThread({ messages }: { messages: Message[] }) {
  // Group messages by date
  const grouped = new Map<string, Message[]>();
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const group = grouped.get(dateKey) ?? [];
    group.push(msg);
    grouped.set(dateKey, group);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([date, msgs]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="mb-4 flex justify-center">
            <span className="rounded-lg bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#667781] shadow-[0_2px_8px_rgba(17,27,33,0.08)] backdrop-blur">
              {date}
            </span>
          </div>

          <div className="space-y-1.5">
            {msgs.map((msg) => {
              const isOutbound = msg.direction === "outbound";
              const isAI = msg.sender_type === "ai";

              return (
                <div
                  key={msg.id}
                  className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group relative max-w-[75%] rounded-xl px-3.5 py-2 shadow-[0_1px_3px_rgba(17,27,33,0.1)] ${
                      isOutbound
                        ? isAI
                          ? "rounded-tr-sm bg-[#C8E6FF]"
                          : "rounded-tr-sm bg-[#D9FDD3]"
                        : "rounded-tl-sm bg-white"
                    }`}
                  >
                    {/* Sender label */}
                    {isOutbound && (
                      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold">
                        {isAI ? (
                          <>
                            <Bot className="size-3 text-[#4A90D9]" />
                            <span className="text-[#4A90D9]">AI Assistant</span>
                          </>
                        ) : (
                          <>
                            <User className="size-3 text-[#1DA851]" />
                            <span className="text-[#1DA851]">You</span>
                          </>
                        )}
                      </p>
                    )}

                    {/* Message body */}
                    <p className="whitespace-pre-wrap text-[13.5px] leading-[1.45] text-[#111B21]">
                      {msg.content}
                    </p>

                    {/* Timestamp + delivery status */}
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      <span className="text-[10.5px] text-[#667781]">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isOutbound && statusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Reply Composer ─────────────────────────────────────────────── */

export function ReplyComposer({
  conversationId,
  customerPhone,
}: {
  conversationId: string;
  customerPhone: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await sendReply(formData);
      setValue("");
      formRef.current?.reset();
      textareaRef.current?.focus();
    });
  }

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex items-end gap-2 border-t border-[#E0E6EA] bg-[#F0F2F5] px-4 py-3"
    >
      <input type="hidden" name="conversation_id" value={conversationId} />
      <input type="hidden" name="customer_phone" value={customerPhone} />

      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          name="message"
          required
          rows={1}
          value={value}
          onChange={handleInput}
          placeholder="Type a message…"
          disabled={isPending}
          className="w-full resize-none rounded-xl border-0 bg-white px-4 py-2.5 text-sm text-[#111B21] shadow-[0_1px_3px_rgba(17,27,33,0.08)] outline-none transition placeholder:text-[#8696A0] focus:ring-2 focus:ring-[#25D366]/30 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (value.trim()) {
                formRef.current?.requestSubmit();
              }
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !value.trim()}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.3)] transition hover:bg-[#1DA851] disabled:opacity-40"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4 translate-x-[1px]" />
        )}
      </button>
    </form>
  );
}
