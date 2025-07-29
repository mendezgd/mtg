"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

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

// Componente de paginación personalizado para búsqueda de cartas
interface CardPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  disabled?: boolean;
}

const CardPagination: React.FC<CardPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  disabled = false,
}) => {
  const handlePageChange = (page: number) => {
    // Validación más estricta para evitar errores
    if (page >= 1 && page <= totalPages && !loading && !disabled) {
      // Solo permitir navegación a páginas cercanas para evitar errores
      const maxJump = 3; // Máximo salto de 3 páginas
      const pageDiff = Math.abs(page - currentPage);
      
      if (pageDiff <= maxJump || page === 1 || page === totalPages) {
        onPageChange(page);
      } else {
        console.warn(`Page jump too large: ${pageDiff} pages. Limiting navigation.`);
        // Si el salto es muy grande, ir a la página más cercana válida
        const targetPage = page > currentPage ? currentPage + maxJump : currentPage - maxJump;
        const validPage = Math.max(1, Math.min(targetPage, totalPages));
        onPageChange(validPage);
      }
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay 5 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <Button
              variant={currentPage === i ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i)}
              disabled={loading || disabled}
              className="w-8 h-8 p-0"
            >
              {i}
            </Button>
          </PaginationItem>
        );
      }
    } else {
      // Mostrar páginas con ellipsis
      if (currentPage <= 3) {
        // Mostrar primeras páginas
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <PaginationItem key={i}>
              <Button
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i)}
                disabled={loading || disabled}
                className="w-8 h-8 p-0"
              >
                {i}
              </Button>
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key="ellipsis1">
            <MoreHorizontal className="h-4 w-4" />
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key={totalPages}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={loading || disabled}
              className="w-8 h-8 p-0"
            >
              {totalPages}
            </Button>
          </PaginationItem>
        );
      } else if (currentPage >= totalPages - 2) {
        // Mostrar últimas páginas
        pages.push(
          <PaginationItem key={1}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={loading || disabled}
              className="w-8 h-8 p-0"
            >
              1
            </Button>
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key="ellipsis2">
            <MoreHorizontal className="h-4 w-4" />
          </PaginationItem>
        );
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(
            <PaginationItem key={i}>
              <Button
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i)}
                disabled={loading || disabled}
                className="w-8 h-8 p-0"
              >
                {i}
              </Button>
            </PaginationItem>
          );
        }
      } else {
        // Mostrar página actual con contexto
        pages.push(
          <PaginationItem key={1}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={loading || disabled}
              className="w-8 h-8 p-0"
            >
              1
            </Button>
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key="ellipsis3">
            <MoreHorizontal className="h-4 w-4" />
          </PaginationItem>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <PaginationItem key={i}>
              <Button
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i)}
                disabled={loading || disabled}
                className="w-8 h-8 p-0"
              >
                {i}
              </Button>
            </PaginationItem>
          );
        }
        pages.push(
          <PaginationItem key="ellipsis4">
            <MoreHorizontal className="h-4 w-4" />
          </PaginationItem>
        );
        pages.push(
          <PaginationItem key={totalPages}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={loading || disabled}
              className="w-8 h-8 p-0"
            >
              {totalPages}
            </Button>
          </PaginationItem>
        );
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading || disabled}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </PaginationItem>
        
        {renderPageNumbers()}
        
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading || disabled}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  CardPagination
}
