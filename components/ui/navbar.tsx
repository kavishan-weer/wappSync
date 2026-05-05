import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Navbar({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
      {...props}
    >
      <div className="container flex h-14 items-center">
        {children}
      </div>
    </nav>
  )
}

export function NavbarBrand({ className, href, children }: { className?: string, href: string, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("mr-6 flex items-center space-x-2 font-bold", className)}
    >
      {children}
    </Link>
  )
}

export function NavbarContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-1 items-center justify-between space-x-2 md:justify-end", className)}>
      {children}
    </div>
  )
}
