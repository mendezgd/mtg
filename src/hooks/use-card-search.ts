import { useState, useCallback } from "react";
import axios from "axios";
import { SearchableCard } from "@/types/card";

// Configurar axios para evitar problemas de CORS
const apiClient = axios.create({
  baseURL: 'https://api.scryfall.com',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

interface SearchFilters {
  type: string;
  color: string;
  manaCost: string;
  basicLands: string;
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
    // Si el filtro de tierras básicas está activo, usar una consulta especial
    if (filters.basicLands && filters.basicLands.trim() !== "") {
      return `name:"${filters.basicLands}"`;
    }

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

  // Función de reintento para peticiones
  const retryRequest = async (url: string, options: any, maxRetries: number = 2) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiClient.get(url, options);
      } catch (error: any) {
        if (attempt === maxRetries) {
          throw error;
        }
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  };

  const searchCards = useCallback(
    async (term: string, filters: SearchFilters, page: number = 1) => {
      if (!term.trim() && !filters.type && !filters.color && !filters.manaCost && !filters.basicLands) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const query = buildSearchQuery(term, filters);
        console.log("Search query:", query); // Debug log
        
        // Verificar que la consulta no esté vacía
        if (!query || query.trim() === "") {
          setError("Consulta de búsqueda vacía. Por favor, ingresa un término de búsqueda o selecciona un filtro.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }
        
        // Siempre usar página 1 y pedir máximo 100 resultados
        const url = `/cards/search?q=${encodeURIComponent(
          query
        )}&page=1&unique=prints&per_page=${MAX_RESULTS}`;

        console.log("Search URL:", url); // Debug log

        const response = await retryRequest(url, {
          timeout: 15000, // 15 segundos de timeout
        });

        const filteredCards = response.data.data.filter(
          (card: SearchableCard) => {
            // Si es búsqueda de tierras básicas, no verificar legalidad de premodern
            if (filters.basicLands && filters.basicLands.trim() !== "") {
              return card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
            }
            
            // Para otras cartas, verificar legalidad de premodern
            return card.legalities?.premodern === "legal" &&
                   (card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal);
          }
        );

        if (filteredCards.length === 0) {
          setSearchResults([]);
          setError("No se encontraron cartas con los criterios especificados. Intenta con términos diferentes o ajusta los filtros.");
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        // Usar directamente las cartas de la búsqueda sin hacer peticiones adicionales
        // Esto evita problemas de CORS y mejora el rendimiento
        const cardsWithPrices = filteredCards.map((card: SearchableCard) => {
          // Asegurar que las cartas tengan la estructura correcta
          return {
            ...card,
            prices: card.prices || {
              usd: null,
              usd_foil: null,
              usd_etched: null,
              eur: null,
              eur_foil: null,
              tix: null,
            }
          };
        });

        setSearchResults(cardsWithPrices);
        setTotalPages(1); // Siempre 1 página
        setCurrentPage(1);
        
        console.log(`Search successful: ${cardsWithPrices.length} cards found with prices`);
      } catch (error: any) {
        console.error("Search error:", error.response?.status, error.response?.data, error.message);
        
        // Manejar diferentes tipos de errores
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
          setError("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.");
          setSearchResults([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else if (error.response?.status === 404 || error.response?.status === 422) {
          console.log("404/422 Error details:", error.response?.data);
          setError("No se encontraron cartas con los criterios especificados. Verifica la consulta: " + query);
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