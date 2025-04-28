"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/CardList";
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
  addCardToDeck: (card: Card) => void;
  onCardPreview: (card: Card) => void;
}

const CardSearch: React.FC<CardSearchProps> = ({
  addCardToDeck,
  onCardPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
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

  const buildSearchQuery = (term: string) => {
    const baseQuery = "format:premodern";
    return term.trim()
      ? `${baseQuery} (name:${term}* OR oracle:${term})`
      : baseQuery;
  };

  const handleSearch = useCallback(
    async (page: number = 1) => {
      if (!searchTerm.trim()) return;

      setLoading(true);
      setError("");
      setSearchResults([]);
      setCurrentPage(page);

      try {
        const query = buildSearchQuery(searchTerm);
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=${page}&unique=prints`;

        const response = await axios.get<{
          data: CardData[];
          total_cards: number;
          per_page: number;
        }>(url);

        const filteredCards = response.data.data.filter(
          (card) =>
            card.legalities?.premodern === "legal" &&
            (card.image_uris?.normal ||
              card.card_faces?.[0]?.image_uris?.normal)
        );

        setSearchResults(filteredCards);
        setTotalPages(
          Math.ceil(response.data.total_cards / response.data.per_page)
        );

        setCardCounts((prev) =>
          filteredCards.reduce(
            (acc, card) => {
              if (!(card.name in acc)) acc[card.name] = 0;
              return acc;
            },
            { ...prev }
          )
        );
      } catch (error: any) {
        setError(
          error.response?.status === 404
            ? "No cards found. Try a different search."
            : "Error searching cards."
        );
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const addCardToDeckWithCount = (card: CardData) => {
    const count = cardCounts[card.name] || 0;
    if (count > 0) {
      Array.from({ length: count }).forEach(() => addCardToDeck(card));
      setCardCounts((prev) => ({ ...prev, [card.name]: 0 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleSearch(newPage);
      searchResultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
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
            <Icons.spinner className="animate-spin h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Icons.search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 p-2 text-sm md:text-base">{error}</div>
      )}

      {/* Search Results */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-12 overflow-y-auto p-1"
        style={{
          height: isMobile ? "calc(100vh - 100px)" : "calc(4 * (240px + 1rem))",
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
                ) : card.card_faces?.[0]?.image_uris?.normal ? (
                  <img
                    src={card.card_faces[0].image_uris.normal}
                    alt={card.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-400 text-xs md:text-sm">
                      No Image
                    </span>
                  </div>
                )}
              </button>
            </div>
            <div className="flex flex-col items-center mt-1 md:mt-2">
              <h3 className="font-semibold text-xs md:text-sm text-center truncate w-full mb-1 md:mb-2">
                {card.name}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs md:text-sm py-1 md:py-2 bg-green-500 hover:bg-green-700 text-white"
                onClick={() => addCardToDeck(card)}
              >
                {isMobile ? "Add" : "Add to Deck"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-2 md:mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={`text-xs md:text-base p-1 md:p-2 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  isActive={page === currentPage}
                  className="text-xs md:text-base p-1 md:p-2"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={`text-xs md:text-base p-1 md:p-2 ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CardSearch;
