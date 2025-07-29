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
const MAX_PAGES = Math.ceil(MAX_RESULTS / CARDS_PER_PAGE); // Máximo 20 páginas

export const useCardSearch = (): UseCardSearchReturn => {
  const [searchResults, setSearchResults] = useState<SearchableCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastValidPage, setLastValidPage] = useState(1);
  const [detectedEndPage, setDetectedEndPage] = useState<number | null>(null);

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

  const validateAndAdjustPage = useCallback((page: number): number => {
    // Asegurar que la página esté entre 1 y el máximo permitido
    return Math.max(1, Math.min(page, MAX_PAGES));
  }, []);

  const adjustTotalPagesIfNeeded = useCallback((currentResults: SearchableCard[], page: number) => {
    // Si esta página tiene menos cartas que CARDS_PER_PAGE, es la última página
    const isLastPage = currentResults.length < CARDS_PER_PAGE;
    
    if (isLastPage && detectedEndPage === null) {
      setDetectedEndPage(page);
      setTotalPages(page);
      console.log(`Detected end of results at page ${page}`);
    }
  }, [detectedEndPage]);

  const searchCards = useCallback(
    async (term: string, filters: SearchFilters, page: number = 1) => {
      if (!term.trim() && !filters.type && !filters.color && !filters.manaCost) {
        return;
      }

      // Validar y ajustar la página solicitada
      const adjustedPage = validateAndAdjustPage(page);

      setLoading(true);
      setError("");

      try {
        const query = buildSearchQuery(term, filters);
        const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          query
        )}&page=${adjustedPage}&unique=prints&per_page=${CARDS_PER_PAGE}`;

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
          setCurrentPage(1);
          setLastValidPage(1);
          setDetectedEndPage(null);
          return;
        }

        setSearchResults(filteredCards);
        
        // Actualizar la última página válida
        setLastValidPage(adjustedPage);
        
        // Ajustar totalPages si se detecta el final de los resultados
        adjustTotalPagesIfNeeded(filteredCards, adjustedPage);
        
        // Solo calcular totalPages si no se ha detectado el final
        if (detectedEndPage === null) {
          const isLastPage = filteredCards.length < CARDS_PER_PAGE;
          
          if (isLastPage) {
            // Si es la última página, el total de páginas es la página actual
            setTotalPages(adjustedPage);
            setDetectedEndPage(adjustedPage);
          } else {
            // Si no es la última página, usar una estimación más conservadora
            const totalFilteredCards = response.data.total_cards;
            // Usar un factor de reducción más conservador (0.6 en lugar de 0.8)
            const estimatedLegalCards = Math.min(totalFilteredCards * 0.6, MAX_RESULTS);
            const calculatedTotalPages = Math.ceil(estimatedLegalCards / CARDS_PER_PAGE);
            
            // Limitar el total de páginas al máximo permitido
            const finalTotalPages = Math.min(
              Math.max(calculatedTotalPages, adjustedPage),
              MAX_PAGES
            );
            setTotalPages(finalTotalPages);
          }
        }
        
        setCurrentPage(adjustedPage);
        setIsRetrying(false);
      } catch (error: any) {
        console.error("Search error:", error.response?.status, error.response?.data);
        
        // Manejar diferentes tipos de errores
        if (error.response?.status === 404 || error.response?.status === 422) {
          // Si es un error de página no encontrada o contenido no procesable
          if (adjustedPage > 1 && !isRetrying) {
            console.log(`Page ${adjustedPage} not found, trying page 1`);
            setIsRetrying(true);
            // Intentar con la página 1
            await searchCards(term, filters, 1);
            return;
          } else {
            // Si ya estamos en la página 1 o ya estamos reintentando
            setError("No se encontraron cartas con los criterios especificados. Intenta con términos diferentes o ajusta los filtros.");
            setSearchResults([]);
            setTotalPages(1);
            setCurrentPage(1);
            setLastValidPage(1);
            setDetectedEndPage(null);
          }
        } else if (error.response?.status === 400) {
          // Error de consulta malformada
          setError("Consulta de búsqueda inválida. Verifica los términos de búsqueda.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
          setLastValidPage(1);
          setDetectedEndPage(null);
        } else if (error.response?.status >= 500) {
          // Errores del servidor
          setError("Error del servidor. Por favor, intenta nuevamente en unos momentos.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
          setLastValidPage(1);
          setDetectedEndPage(null);
        } else {
          // Otros errores
          setError("Error al buscar cartas. Por favor, intenta nuevamente.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
          setLastValidPage(1);
          setDetectedEndPage(null);
        }
        
        setIsRetrying(false);
      } finally {
        setLoading(false);
      }
    },
    [buildSearchQuery, validateAndAdjustPage, isRetrying, adjustTotalPagesIfNeeded, detectedEndPage]
  );

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError("");
    setCurrentPage(1);
    setTotalPages(1);
    setLastValidPage(1);
    setDetectedEndPage(null);
    setIsRetrying(false);
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