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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const searchCardByName = useCallback(
    async (name: string): Promise<Card | null> => {
      try {
        const response = await fetch(
          `/api/cards?name=${encodeURIComponent(name)}`
        );
        const data = await response.json();
        return data[0] || null;
      } catch (error) {
        console.error("Error buscando carta:", error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isMobile) {
        setIsMobile(true);
      } else if (window.innerWidth >= 768 && isMobile) {
        setIsMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

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
    <div className="flex flex-col h-full space-y-2 md:space-y-4">
      {/* Barra de búsqueda responsive */}
      <div className="flex flex-col md:flex-row gap-2">
        <input
          onFocus={(e) => {
            if (isMobile) {
              e.currentTarget.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }}
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
          ) : isMobile ? (
            <Icons.search className="h-4 w-4" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 p-2 text-sm md:text-base">{error}</div>
      )}

      {/* Resultados adaptativos */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-4 overflow-y-auto p-1"
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
                    decoding="async"
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : card.card_faces?.[0]?.image_uris?.normal ? (
                  <img
                    src={card.card_faces[0].image_uris.normal}
                    alt={card.name}
                    decoding="async"
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

      {/* Paginación responsive */}
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
