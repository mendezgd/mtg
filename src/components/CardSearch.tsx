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
  const [selectedCardPrints, setSelectedCardPrints] = useState<CardData[]>([]);
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const fetchCardPrints = async (card: CardData) => {
    if (!card.prints_search_uri) return [];

    try {
      const response = await axios.get(card.prints_search_uri);
      return response.data.data.filter(
        (print: CardData) =>
          print.legalities?.premodern === "legal" &&
          (print.image_uris?.normal ||
            print.card_faces?.[0]?.image_uris?.normal)
      );
    } catch (error) {
      console.error("Error fetching card prints:", error);
      return [];
    }
  };

  const buildSearchQuery = (term: string) => {
    const baseQuery = "format:premodern";
    if (!term.trim()) return baseQuery;

    // Búsqueda flexible que funciona con nombres parciales
    return `${baseQuery} name:${term}*`;
  };

  const handleSearch = useCallback(
    async (page: number = 1) => {
      if (!searchTerm.trim()) return;

      setLoading(true);
      setError("");
      setSelectedCardPrints([]);
      setSelectedCardName(null);

      try {
        const query = buildSearchQuery(searchTerm);
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.scryfall.com/cards/search?q=${encodedQuery}&page=${page}&unique=prints`;

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
                (card.image_uris?.normal ||
                  card.card_faces?.[0]?.image_uris?.normal)
            )
            .sort((a: CardData, b: CardData) => {
              // Ordenar por mejor coincidencia
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
        if (error.response?.status === 404) {
          setError("No cards found. Try a different search.");
        } else if (error.response?.status === 422) {
          // Si falla la búsqueda con wildcard, intentamos una búsqueda exacta
          handleExactSearch(page);
        } else {
          setError("Error searching cards. Please try again.");
        }
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm]
  );

  const handleExactSearch = async (page: number) => {
    try {
      const exactQuery = `format:premodern name:"${searchTerm.trim()}"`;
      const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        exactQuery
      )}&page=${page}`;

      const response = await axios.get(url);
      if (response.status === 200) {
        const filteredCards = response.data.data.filter(
          (card: CardData) =>
            card.legalities?.premodern === "legal" &&
            (card.image_uris?.normal ||
              card.card_faces?.[0]?.image_uris?.normal)
        );
        setSearchResults(filteredCards);
        setTotalPages(
          Math.ceil(response.data.total_cards / response.data.per_page)
        );
      }
    } catch (exactError) {
      setError("No matching cards found.");
      setSearchResults([]);
    }
  };

  const handleShowAlternateArts = async (card: CardData) => {
    setLoading(true);
    try {
      const prints = await fetchCardPrints(card);
      setSelectedCardPrints(prints);
      setSelectedCardName(card.name);
    } catch (error) {
      setError("Could not load alternate arts");
    } finally {
      setLoading(false);
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
          placeholder="Search for cards (e.g. 'dures' or 'gobl')"
          className="w-full p-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
        />
        <Button
          onClick={() => handleSearch(1)}
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? <Icons.spinner className="animate-spin" /> : "Search"}
        </Button>
      </div>

      {error && <div className="text-red-500 p-2">{error}</div>}

      {/* Main Results */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 gap-4 overflow-y-auto p-1"
        style={{
          height:
            selectedCardPrints.length > 0
              ? "300px"
              : "calc(4 * (200px + 1rem))",
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
              {card.image_uris?.normal ? (
                <img
                  src={card.image_uris.normal}
                  alt={card.name}
                  className="w-full h-28 object-contain mb-1"
                  loading="lazy"
                />
              ) : card.card_faces?.[0]?.image_uris?.normal ? (
                <img
                  src={card.card_faces[0].image_uris.normal}
                  alt={card.name}
                  className="w-full h-28 object-contain mb-1"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-28 bg-gray-600 flex items-center justify-center mb-1">
                  <span>No Image</span>
                </div>
              )}
              <h3 className="font-semibold text-sm text-center truncate w-full">
                {card.name}
              </h3>
              <p className="text-xs text-gray-300 text-center">
                {card.set_name} • {card.mana_cost}
              </p>
            </button>

            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleShowAlternateArts(card)}
              >
                View Arts
              </Button>
              <div className="flex items-center space-x-1">
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
            </div>
          </div>
        ))}
      </div>

      {/* Alternate Arts Section */}
      {selectedCardPrints.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">
            Alternate Arts for {selectedCardName}
          </h3>
          <div className="grid grid-cols-4 gap-3 overflow-x-auto pb-2">
            {selectedCardPrints.map((print) => (
              <div
                key={print.id}
                className="bg-gray-700 rounded-lg p-2 shadow flex flex-col"
              >
                <img
                  src={
                    print.image_uris?.normal ||
                    print.card_faces?.[0]?.image_uris?.normal ||
                    ""
                  }
                  alt={`${print.name} - ${print.set_name}`}
                  className="w-full h-40 object-contain"
                  loading="lazy"
                />
                <p className="text-xs text-center mt-1">{print.set_name}</p>
                <Button
                  size="sm"
                  className="mt-1 text-xs h-6"
                  onClick={() => addCardToDeck(print)}
                >
                  Add to Deck
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-2">
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
