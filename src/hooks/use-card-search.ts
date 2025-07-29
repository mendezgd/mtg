import { useState, useCallback } from "react";
import axios from "axios";
import { SearchableCard } from "@/types/card";

interface SearchFilters {
  type: string;
  color: string;
  manaCost: string;
}

interface UseCardSearchReturn {
  searchResults: SearchableCard[];
  loading: boolean;
  error: string;
  currentPage: number;
  totalPages: number;
  searchCards: (term: string, filters: SearchFilters, page?: number) => Promise<void>;
  clearResults: () => void;
}

const MAX_RESULTS = 500;
const CARDS_PER_PAGE = 25;

export const useCardSearch = (): UseCardSearchReturn => {
  const [searchResults, setSearchResults] = useState<SearchableCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const buildSearchQuery = useCallback((term: string, filters: SearchFilters) => {
    const baseQuery = "format:premodern";
    const typeFilter = filters.type ? ` type:${filters.type}` : "";
    const colorFilter = filters.color ? ` color:${filters.color}` : "";
    const manaCostFilter = filters.manaCost
      ? filters.manaCost === "8+"
        ? " cmc>=8"
        : ` cmc:${filters.manaCost}`
      : "";

    return term.trim()
      ? `${baseQuery} (name:${term}* OR oracle:${term})${typeFilter}${colorFilter}${manaCostFilter}`
      : `${baseQuery}${typeFilter}${colorFilter}${manaCostFilter}`;
  }, []);

  const searchCards = useCallback(
    async (term: string, filters: SearchFilters, page: number = 1) => {
      if (!term.trim() && !filters.type && !filters.color && !filters.manaCost) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const query = buildSearchQuery(term, filters);
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=${page}&unique=prints&per_page=${CARDS_PER_PAGE}`;

        const response = await axios.get(url);

        const filteredCards = response.data.data.filter(
          (card: SearchableCard) =>
            card.legalities?.premodern === "legal" &&
            (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal)
        );

        if (filteredCards.length === 0) {
          setSearchResults([]);
          setError("No cards found. Try a different search.");
          setTotalPages(1);
          return;
        }

        setSearchResults(filteredCards);
        const totalFilteredCards = response.data.total_cards;
        const calculatedTotalPages = Math.ceil(
          Math.min(totalFilteredCards, MAX_RESULTS) / CARDS_PER_PAGE
        );
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);
      } catch (error: any) {
        setError(
          error.response?.status === 404
            ? "No cards found. Try a different search."
            : "Error searching cards."
        );
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [buildSearchQuery]
  );

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError("");
    setCurrentPage(1);
    setTotalPages(1);
  }, []);

  return {
    searchResults,
    loading,
    error,
    currentPage,
    totalPages,
    searchCards,
    clearResults,
  };
}; 