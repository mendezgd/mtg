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
    <div className="flex flex-col h-full space-y-4">
      {/* Barra de búsqueda */}
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

      {/* Resultados con imágenes */}
      <div
        ref={searchResultsRef}
        className="grid grid-cols-3 gap-12 overflow-y-auto p-1"
        style={{
          height: "calc(4 * (240px + 1rem))",
          scrollbarWidth: "thin",
        }}
      >
        {searchResults.map((card) => (
          <div key={card.id} className="rounded-lg p-2 flex flex-col h-[240px]">
            {/* Contenedor de la imagen */}
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
                    <span className="text-gray-400">Imagen no disponible</span>
                  </div>
                )}
              </button>
            </div>

            {/* Nombre y botón */}
            <div className="flex flex-col items-center">
              <h3 className="font-semibold text-sm text-center truncate w-full mb-2">
                {card.name}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold"
                onClick={() => addCardToDeck(card)}
              >
                Add to Deck
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación - Sin cambios */}
      {totalPages > 1 && <Pagination className="mt-2">{/* ... */}</Pagination>}
    </div>
  );
};

export default CardSearch;
