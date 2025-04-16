"use client";

import React, { useState, useCallback, useRef } from "react";
import axios from "axios";
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
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  oracle_text?: string;
  legalities: {
    premodern: string;
  };
  mana_cost?: string;
  type_line?: string;
}

interface CardSearchProps {
  addCardToDeck: (card: CardData) => void;
  onCardPreview: (card: CardData) => void;
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

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    async (page: number = 1) => {
      if (!searchTerm.trim()) return;

      setLoading(true);
      setError("");

      try {
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          `name:${searchTerm.trim()}*`
        )}&page=${page}`;

        const response = await axios.get<{
          data: CardData[];
          total_cards: number;
          per_page: number;
        }>(url);

        if (response.status === 200) {
          const filteredCards = response.data.data
            .filter(
              (card: CardData) =>
                card.legalities?.premodern === "legal" &&
                card.image_uris?.normal
            )
            .sort((a: CardData, b: CardData) => {
              const aStartsWith = a.name
                .toLowerCase()
                .startsWith(searchTerm.toLowerCase());
              const bStartsWith = b.name
                .toLowerCase()
                .startsWith(searchTerm.toLowerCase());
              return Number(bStartsWith) - Number(aStartsWith);
            });

          setSearchResults(filteredCards);
          setTotalPages(
            Math.ceil(response.data.total_cards / response.data.per_page)
          );
          setCurrentPage(page);

          setCardCounts((prev) => {
            const newCounts = { ...prev };
            filteredCards.forEach((card: CardData) => {
              if (!(card.name in newCounts)) {
                newCounts[card.name] = 0;
              }
            });
            return newCounts;
          });
        }
      } catch (error: any) {
        if (error.response?.status === 422) {
          setError("Invalid search query. Try using simpler terms.");
        } else if (error.response?.status === 404) {
          setError("No cards found. Try a different search.");
        } else {
          setError(
            "Error connecting to card database. Please try again later."
          );
        }
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch(1);
    }
  };

  const incrementCount = (card: CardData) => {
    setCardCounts((prevCounts) => {
      const currentCount = prevCounts[card.name] || 0;
      return currentCount < 4
        ? { ...prevCounts, [card.name]: currentCount + 1 }
        : prevCounts;
    });
  };

  const decrementCount = (card: CardData) => {
    setCardCounts((prevCounts) => {
      const currentCount = prevCounts[card.name] || 0;
      return currentCount > 0
        ? { ...prevCounts, [card.name]: currentCount - 1 }
        : prevCounts;
    });
  };

  const addCardToDeckWithCount = (card: CardData) => {
    const count = cardCounts[card.name] || 0;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        addCardToDeck(card);
      }
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
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter card name and press Search"
          className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={() => handleSearch(1)}
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? <Icons.spinner className="animate-spin" /> : "Search"}
        </Button>
      </div>

      {error && <div className="text-red-500 p-2">{error}</div>}

      {/* Results Container */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 gap-4 overflow-y-auto p-1"
        style={{
          height: "calc(4 * (200px + 1rem))",
          scrollbarWidth: "thin",
        }}
      >
        {searchResults.map((card) => (
          <div
            key={card.id}
            className="bg-gray-700 rounded-lg p-3 shadow-lg flex flex-col h-[200px]"
          >
            <button
              onClick={() => onCardPreview(card)}
              className="flex-1 flex flex-col items-center hover:opacity-75 transition-opacity"
            >
              {card.image_uris?.normal && (
                <img
                  src={card.image_uris.normal}
                  alt={card.name}
                  className="w-full h-28 object-contain mb-1"
                  loading="lazy"
                />
              )}
              <h3 className="font-semibold text-sm text-center truncate w-full">
                {card.name}
              </h3>
              <p className="text-xs text-gray-300 text-center">
                {card.mana_cost}
              </p>
            </button>

            <div className="flex items-center justify-center mt-1 space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => decrementCount(card)}
              >
                -
              </Button>
              <span className="px-2 py-1 bg-gray-800 rounded text-sm">
                {cardCounts[card.name] || 0}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => incrementCount(card)}
              >
                +
              </Button>
            </div>

            <Button
              size="sm"
              className="w-full mt-1 h-6 text-xs"
              onClick={() => addCardToDeckWithCount(card)}
            >
              Add to Deck
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              return (
                page <= totalPages && (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CardSearch;
