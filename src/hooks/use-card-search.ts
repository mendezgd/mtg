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
  adjustTotalPagesOnError: (failedPage: number) => void;
}

const MAX_RESULTS = 100; // Máximo 100 resultados en una sola página

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
        // Siempre usar página 1 y pedir máximo 100 resultados
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=1&unique=prints&per_page=${MAX_RESULTS}`;

        const response = await axios.get(url);

        const filteredCards = response.data.data.filter(
          (card: SearchableCard) =>
            card.legalities?.premodern === "legal" &&
            (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal)
        );

        if (filteredCards.length === 0) {
          setSearchResults([]);
          setError("No se encontraron cartas con los criterios especificados. Intenta con términos diferentes o ajusta los filtros.");
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        setSearchResults(filteredCards);
        setTotalPages(1); // Siempre 1 página
        setCurrentPage(1);
        
        console.log(`Search successful: ${filteredCards.length} cards found`);
      } catch (error: any) {
        console.error("Search error:", error.response?.status, error.response?.data);
        
        // Manejar diferentes tipos de errores
        if (error.response?.status === 404 || error.response?.status === 422) {
          setError("No se encontraron cartas con los criterios especificados. Intenta con términos diferentes o ajusta los filtros.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else if (error.response?.status === 400) {
          setError("Consulta de búsqueda inválida. Verifica los términos de búsqueda.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else if (error.response?.status >= 500) {
          setError("Error del servidor. Por favor, intenta nuevamente en unos momentos.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          setError("Error al buscar cartas. Por favor, intenta nuevamente.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [buildSearchQuery]
  );

  // Función para ajustar totalPages cuando se detecta que una página no existe
  const adjustTotalPagesOnError = useCallback((failedPage: number) => {
    // No hacer nada, siempre es 1 página
    console.log(`Page ${failedPage} failed, but we only use 1 page`);
  }, []);

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
    adjustTotalPagesOnError,
  };
}; 