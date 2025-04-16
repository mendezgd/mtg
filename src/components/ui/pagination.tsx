"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto w-full max-w-sm [&>*:not(:first-child)]:mt-2", className)}
    {...props}
  />
))
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex w-full justify-center gap-2", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md bg-background text-sm font-medium transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground",
          isActive && "bg-secondary text-secondary-foreground",
          className
        )}
        {...props}
        data-active={isActive}
      />
    )
  }
)
PaginationLink.displayName = "PaginationLink"

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-background text-sm font-medium transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground h-8 w-8",
      className
    )}
    {...props}
  />
))
PaginationNext.displayName = "PaginationNext"

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-background text-sm font-medium transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground h-8 w-8",
      className
    )}
    {...props}
  />
))
PaginationPrevious.displayName = "PaginationPrevious"

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious }
