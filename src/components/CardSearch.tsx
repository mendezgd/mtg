"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import type { Card as CardListCard } from "@/components/CardList";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Icons } from "@/components/icons";

interface CardData {
  id: string;
  name: string;
  set_name: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  card_faces?: Array<{
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }>;
  oracle_text?: string;
  legalities: {
    premodern: string;
  };
  mana_cost?: string;
  type_line?: string;
  prints_search_uri?: string;
}

interface CardSearchProps {
  addCardToDeck: (card: CardData | CardListCard) => void;
  onCardPreview: (card: CardData | CardListCard) => void;
}

const MAX_RESULTS = 100; // Limit for results
const CARDS_PER_PAGE = 25; // Maximum allowed by Scryfall

const CardSearch: React.FC<CardSearchProps> = ({
  addCardToDeck,
  onCardPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build the search query for Scryfall
  const buildSearchQuery = (term: string) => {
    const baseQuery = "format:premodern";
    return term.trim()
      ? `${baseQuery} (name:${term}* OR oracle:${term})`
      : baseQuery;
  };

  // Handle the search functionality
  const handleSearch = useCallback(
    async (page: number = 1) => {
      if (!searchTerm.trim()) return;

      setLoading(true);
      setError("");
      setSearchResults([]);

      try {
        const query = buildSearchQuery(searchTerm);
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=${page}&unique=prints&per_page=${CARDS_PER_PAGE}`;

        const response = await axios.get(url);

        // Filter valid cards
        const filteredCards = response.data.data.filter(
          (card: CardData) =>
            card.legalities?.premodern === "legal" &&
            (card.image_uris?.normal ||
              card.card_faces?.[0]?.image_uris?.normal)
        );

        if (filteredCards.length === 0) {
          throw new Error("No cards found after filtering");
        }

        setSearchResults(filteredCards);

        // Calculate total pages
        const calculatedTotalPages = Math.ceil(
          Math.min(response.data.total_cards, MAX_RESULTS) / CARDS_PER_PAGE
        );
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);
      } catch (error: any) {
        setError(
          error.message === "No cards found after filtering"
            ? "No valid cards found. Try a different search."
            : error.response?.status === 404
            ? "No cards found. Try a different search."
            : "Error searching cards."
        );
        setCurrentPage(1);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      handleSearch(newPage);
      searchResultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get visible pages for pagination
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  };

  return (
    <div className="flex flex-col h-full space-y-2 md:space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search cards..."
          className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
        />
        <Button
          onClick={() => handleSearch(1)}
          disabled={loading || !searchTerm.trim()}
          className="md:w-auto w-full py-2 px-4"
        >
          {loading ? (
            <Icons.spinner className="animate-spin h-4 w-4" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {error && <div className="text-red-500 p-2 text-sm">{error}</div>}

      {/* Search Results */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto p-1"
        style={{
          height: isMobile ? "calc(100vh - 200px)" : "calc(4 * (240px + 1rem))",
        }}
      >
        {searchResults.map((card) => (
          <div
            key={card.id}
            className="rounded-lg p-1 md:p-2 flex flex-col h-[180px] md:h-[240px]"
          >
            <div className="flex-1 relative group">
              <button
                onClick={() => onCardPreview(card)}
                className="w-full h-full"
              >
                {card.image_uris?.normal ? (
                  <img
                    src={card.image_uris.normal}
                    alt={card.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </button>
            </div>
            <div className="flex flex-col items-center mt-1">
              <h3 className="font-semibold text-xs text-center truncate w-full mb-1">
                {card.name}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs py-1 bg-green-500 hover:bg-green-700 text-white"
                onClick={() => addCardToDeck(card)}
              >
                {isMobile ? "Add" : "Add to Deck"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {/* First Page Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            className={
              currentPage === 1 ? "opacity-50 pointer-events-none" : ""
            }
          />
        </PaginationItem>

        {/* Previous Page Button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={
              currentPage === 1 ? "opacity-50 pointer-events-none" : ""
            }
          />
        </PaginationItem>

        {/* Visible Page Numbers */}
        {getVisiblePages().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page);
              }}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next Page Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={
              currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
            }
          />
        </PaginationItem>

        {/* Last Page Button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            className={
              currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
            }
          />
        </PaginationItem>
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} • {searchResults.length} resultados
      </div>

      {/* Mobile Page Selector */}
      {isMobile && (
        <select
          value={currentPage}
          onChange={(e) => handlePageChange(Number(e.target.value))}
          className="bg-background border rounded-md p-1 text-sm"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              Página {page}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CardSearch;
export type { CardData };
