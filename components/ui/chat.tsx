import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatMessageProps {
  message: string
  isSender?: boolean
  avatar?: string
  fallback?: string
  timestamp?: string
  className?: string
}

export function ChatMessage({
  message,
  isSender = false,
  avatar,
  fallback,
  timestamp,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 p-4",
        isSender ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      <Avatar className="h-8 w-8">
        {avatar && <AvatarImage src={avatar} />}
        <AvatarFallback>{fallback || (isSender ? "ME" : "TH")}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isSender ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isSender
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {message}
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted-foreground uppercase">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}

export function ChatList({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 overflow-y-auto", className)}>
      {children}
    </div>
  )
}

export function ChatInput({ 
  className, 
  placeholder = "Type a message...",
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex items-center gap-2 border-t p-4", className)}>
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}
