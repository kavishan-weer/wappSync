import * as React from "react"
import { cn } from "@/lib/utils"

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Layout({ className, children, ...props }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", className)} {...props}>
      {children}
    </div>
  )
}

export function PageHeader({ className, children, ...props }: LayoutProps) {
  return (
    <header
      className={cn(
        "flex flex-col items-start gap-2 px-4 py-8 md:px-8 md:py-12 lg:py-16",
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
}

export function PageContent({ className, children, ...props }: LayoutProps) {
  return (
    <main className={cn("flex-1 px-4 md:px-8", className)} {...props}>
      {children}
    </main>
  )
}
