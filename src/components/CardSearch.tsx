"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableCard } from "@/types/card";
import { useCardSearch } from "@/hooks/use-card-search";
import { useFilterHandler } from "@/hooks/use-filter-handler";
import { CardGrid } from "@/components/ui/card-grid";
import { SearchFilters } from "@/components/ui/search-filters";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { CardPagination } from "@/components/ui/pagination";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";

interface CardSearchProps {
  addCardToDeck: (card: SearchableCard) => void;
  onCardPreview: (card: SearchableCard) => void;
}

const CardSearch: React.FC<CardSearchProps> = ({
  addCardToDeck,
  onCardPreview,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchResults,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    searchCards,
    clearResults,
    adjustTotalPagesOnError,
  } = useCardSearch();

  // Función para realizar búsqueda automática
  const performSearch = useCallback(
    async (
      term: string,
      filters: {
        type: string;
        color: string;
        manaCost: string;
        basicLands: string;
      }
    ) => {
      // Solo buscar si hay término de búsqueda O filtros activos O tierras básicas
      const hasSearchTerm = term.trim().length > 0;
      const hasFilters = filters.type || filters.color || filters.manaCost;
      const hasBasicLands =
        filters.basicLands && filters.basicLands.trim() !== "";

      if (!hasSearchTerm && !hasFilters && !hasBasicLands) {
        clearResults();
        return;
      }

      setIsSearching(true);
      try {
        await searchCards(term, filters);
      } finally {
        setIsSearching(false);
      }
    },
    [searchCards, clearResults]
  );

  // Use the unified filter handler
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useFilterHandler(searchTerm, performSearch);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Permitir búsqueda si hay término O filtros activos O tierras básicas
      const hasSearchTerm = searchTerm.trim().length > 0;
      const hasFilters = filters.type || filters.color || filters.manaCost;
      const hasBasicLands =
        filters.basicLands && filters.basicLands.trim() !== "";

      if (!hasSearchTerm && !hasFilters && !hasBasicLands) {
        return; // No buscar si no hay nada
      }

      await performSearch(searchTerm, filters);
    },
    [searchTerm, filters, performSearch]
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
    clearFilters();
    clearResults();
  }, [clearFilters, clearResults]);

  const handleCardClick = useCallback(
    async (card: SearchableCard) => {
      logger.debug("Card clicked:", card.name);
      onCardPreview(card);
    },
    [onCardPreview]
  );

  const handleAddToDeck = useCallback(
    (card: SearchableCard) => {
      logger.debug("Adding card to deck:", card.name);
      addCardToDeck(card);
    },
    [addCardToDeck]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      // Validar que la página esté dentro del rango válido
      if (newPage < 1 || newPage > totalPages) {
        return;
      }

      searchCards(searchTerm, filters, newPage);
    },
    [searchTerm, filters, searchCards, totalPages]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar cartas (ej: merfolk, lightning bolt, forest...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-900/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Search Filters */}
        <SearchFilters
          selectedType={filters.type}
          selectedColor={filters.color}
          selectedManaCost={filters.manaCost}
          selectedBasicLand={filters.basicLands}
          onTypeChange={(value) => updateFilter("type", value)}
          onColorChange={(value) => updateFilter("color", value)}
          onManaCostChange={(value) => updateFilter("manaCost", value)}
          onBasicLandChange={(value) => updateFilter("basicLands", value)}
        />

        {/* Search Actions */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading || (!searchTerm.trim() && !hasActiveFilters)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-200 btn-hover"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("deckBuilder.searching")}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {searchTerm.trim()
                  ? t("deckBuilder.searchCards")
                  : t("deckBuilder.exploreWithFilters")}
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            variant="outline"
            className="px-4 py-3 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            {t("common.clear")}
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <div className="ml-auto flex gap-2">
            {error.includes("Error de conexión") && (
              <Button
                onClick={() => handleSearch(new Event("submit") as any)}
                variant="outline"
                size="sm"
                className="text-xs border-red-500/30 hover:border-red-500/50"
              >
                {t("common.retry")}
              </Button>
            )}
            {(error.includes("No se encontraron cartas") ||
              error.includes("No cards found")) && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-xs border-red-500/30 hover:border-red-500/50"
              >
                {t("common.clear")}
              </Button>
            )}
            {error.includes("No hay más páginas disponibles") && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-xs border-red-500/30 hover:border-red-500/50"
              >
                {t("common.clear")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="flex-1 overflow-hidden">
        {searchResults.length > 0 && (
          <div className="h-full flex flex-col">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-300">
                {totalResults > 0
                  ? `${searchResults.length} ${t("common.of")} ${totalResults} ${t("deckBuilder.cards")}`
                  : `${searchResults.length} ${t("deckBuilder.cardsFound")}`}
                {totalResults > searchResults.length && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({t("common.page")} {currentPage} {t("common.of")}{" "}
                    {totalPages})
                  </span>
                )}
              </span>
              {totalPages > 1 && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {t("common.next")}
                  </Button>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-auto w-full pb-8 md:pb-4">
              {totalResults > searchResults.length && (
                <div className="mb-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                  <p>
                    {t("deckBuilder.totalCardsFound").replace(
                      "{count}",
                      totalResults.toString()
                    )}{" "}
                    {t("deckBuilder.useNavigationButtons")}
                  </p>
                </div>
              )}
              <CardGrid
                cards={searchResults}
                onCardClick={handleCardClick}
                onCardPreview={onCardPreview}
                onAddToDeck={handleAddToDeck}
                className="animate-fade-in w-full"
              />
              {/* Espacio adicional para móvil */}
              <div className="h-20 md:h-0"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchTerm && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              {t("deckBuilder.deckNotFound")}
            </h3>
            <p className="text-gray-400 mb-4">
              {t("deckBuilder.deckInvalidCards")}
            </p>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-gray-600 hover:border-gray-500"
            >
              {t("common.clear")}
            </Button>
          </div>
        )}

        {/* Error State */}
        {!loading && searchResults.length === 0 && error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              {t("common.error")}
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">{error}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-gray-600 hover:border-gray-500"
              >
                {t("common.clear")}
              </Button>
              <Button
                onClick={() => handleSearch(new Event("submit") as any)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {t("common.refresh")}
              </Button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading &&
          searchResults.length === 0 &&
          !searchTerm &&
          !hasActiveFilters &&
          !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-300">
                {t("deckBuilder.search")}
              </h3>
              <p className="text-gray-400 max-w-md">
                {t("deckBuilder.previewDescription")}
              </p>
            </div>
          )}

        {/* Filters Only State */}
        {!loading &&
          searchResults.length === 0 &&
          !searchTerm &&
          hasActiveFilters &&
          !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-300">
                {t("deckBuilder.search")}
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                {t("deckBuilder.deckInvalidCards")}
              </p>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-gray-600 hover:border-gray-500"
              >
                {t("common.clear")}
              </Button>
            </div>
          )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">{t("deckBuilder.loading")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSearch;
