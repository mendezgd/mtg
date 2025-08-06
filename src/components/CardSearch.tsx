"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableCard } from "@/types/card";
import { useCardSearch } from "@/hooks/use-card-search";
import { CardGrid } from "@/components/ui/card-grid";
import { SearchFilters } from "@/components/ui/search-filters";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { CardPagination } from "@/components/ui/pagination";
import { scryfallAPI } from "@/lib/scryfall-api";

interface CardSearchProps {
  addCardToDeck: (card: SearchableCard) => void;
  onCardPreview: (card: SearchableCard) => void;
}

const CardSearch: React.FC<CardSearchProps> = ({ addCardToDeck, onCardPreview }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedManaCost, setSelectedManaCost] = useState<string>("");
  const [selectedBasicLand, setSelectedBasicLand] = useState<string>("");
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
    async (term: string, filters: { type: string; color: string; manaCost: string; basicLands: string }) => {
      // Solo buscar si hay término de búsqueda O filtros activos O tierras básicas
      const hasSearchTerm = term.trim().length > 0;
      const hasFilters = filters.type || filters.color || filters.manaCost;
      const hasBasicLands = filters.basicLands && filters.basicLands.trim() !== "";
      
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

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Permitir búsqueda si hay término O filtros activos O tierras básicas
      const hasSearchTerm = searchTerm.trim().length > 0;
      const hasFilters = selectedType || selectedColor || selectedManaCost;
      const hasBasicLands = selectedBasicLand && selectedBasicLand.trim() !== "";
      
      if (!hasSearchTerm && !hasFilters && !hasBasicLands) {
        return; // No buscar si no hay nada
      }
      
      await performSearch(searchTerm, {
        type: selectedType,
        color: selectedColor,
        manaCost: selectedManaCost,
        basicLands: selectedBasicLand,
      });
    },
    [searchTerm, selectedType, selectedColor, selectedManaCost, selectedBasicLand, performSearch]
  );

  // Función para manejar cambios de filtros
  const handleFilterChange = useCallback(
    (filterType: 'type' | 'color' | 'manaCost', value: string) => {
      const newFilters = {
        type: filterType === 'type' ? value : selectedType,
        color: filterType === 'color' ? value : selectedColor,
        manaCost: filterType === 'manaCost' ? value : selectedManaCost,
        basicLands: selectedBasicLand,
      };

      // Actualizar el estado del filtro
      if (filterType === 'type') setSelectedType(value);
      if (filterType === 'color') setSelectedColor(value);
      if (filterType === 'manaCost') setSelectedManaCost(value);

      // Realizar búsqueda automática
      performSearch(searchTerm, newFilters);
    },
    [searchTerm, selectedType, selectedColor, selectedManaCost, selectedBasicLand, performSearch]
  );

  // Funciones específicas para cada filtro
  const handleTypeChange = useCallback((value: string) => {
    handleFilterChange('type', value);
  }, [handleFilterChange]);

  const handleColorChange = useCallback((value: string) => {
    handleFilterChange('color', value);
  }, [handleFilterChange]);

  const handleManaCostChange = useCallback((value: string) => {
    handleFilterChange('manaCost', value);
  }, [handleFilterChange]);

  const handleBasicLandChange = useCallback((value: string) => {
    setSelectedBasicLand(value);
    const newFilters = {
      type: selectedType,
      color: selectedColor,
      manaCost: selectedManaCost,
      basicLands: value,
    };
    performSearch(searchTerm, newFilters);
  }, [selectedType, selectedColor, selectedManaCost, searchTerm, performSearch]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedColor("");
    setSelectedManaCost("");
    setSelectedBasicLand("");
    clearResults();
  }, [clearResults]);

  const handleCardClick = useCallback(
    async (card: SearchableCard) => {
      // Usar directamente la carta seleccionada sin buscar precios adicionales
      // Esto asegura que se muestre exactamente la carta que el usuario seleccionó
      onCardPreview(card);
    },
    [onCardPreview]
  );

  const handleAddToDeck = useCallback(
    (card: SearchableCard) => {
      addCardToDeck(card);
    },
    [addCardToDeck]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      searchCards(searchTerm, {
        type: selectedType,
        color: selectedColor,
        manaCost: selectedManaCost,
        basicLands: selectedBasicLand,
      }, newPage);
    },
    [searchTerm, selectedType, selectedColor, selectedManaCost, selectedBasicLand, searchCards]
  );

  return (
    <div className="flex flex-col h-full">
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
          selectedType={selectedType}
          selectedColor={selectedColor}
          selectedManaCost={selectedManaCost}
          selectedBasicLand={selectedBasicLand}
          onTypeChange={handleTypeChange}
          onColorChange={handleColorChange}
          onManaCostChange={handleManaCostChange}
          onBasicLandChange={handleBasicLandChange}
        />

        {/* Search Actions */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading || (!searchTerm.trim() && !selectedType && !selectedColor && !selectedManaCost && !selectedBasicLand)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-200 btn-hover"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {searchTerm.trim() ? "Buscar Cartas" : "Explorar con Filtros"}
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            variant="outline"
            className="px-4 py-3 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            Limpiar
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
                onClick={() => handleSearch(new Event('submit') as any)}
                variant="outline"
                size="sm"
                className="text-xs border-red-500/30 hover:border-red-500/50"
              >
                Reintentar
              </Button>
            )}
            {(error.includes("No se encontraron cartas") || error.includes("No cards found")) && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-xs border-red-500/30 hover:border-red-500/50"
              >
                Limpiar
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
                {totalResults > 0 ? `${searchResults.length} de ${totalResults} cartas` : `${searchResults.length} cartas encontradas`}
                {totalResults > searchResults.length && (
                  <span className="text-xs text-gray-400 ml-2">
                    (página {currentPage} de {totalPages})
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
                    Anterior
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-auto w-full">
              {totalResults > searchResults.length && (
                <div className="mb-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 text-xs">
                  <p>Se encontraron {totalResults} cartas en total. Usa los botones de navegación para ver más resultados.</p>
                </div>
              )}
              <CardGrid
                cards={searchResults}
                onCardClick={handleCardClick}
                onCardPreview={onCardPreview}
                onAddToDeck={handleAddToDeck}
                className="animate-fade-in w-full"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchTerm && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              No se encontraron cartas
            </h3>
            <p className="text-gray-400 mb-4">
              Intenta con términos diferentes o ajusta los filtros
            </p>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-gray-600 hover:border-gray-500"
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}

        {/* Error State */}
        {!loading && searchResults.length === 0 && error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Error en la búsqueda
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              {error}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-gray-600 hover:border-gray-500"
              >
                Limpiar búsqueda
              </Button>
              <Button
                onClick={() => handleSearch(new Event('submit') as any)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Intentar nuevamente
              </Button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && searchResults.length === 0 && !searchTerm && !selectedType && !selectedColor && !selectedManaCost && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Busca tu próxima carta
            </h3>
            <p className="text-gray-400 max-w-md">
              Ingresa el nombre de una carta, tipo, color o cualquier término para comenzar tu búsqueda. También puedes usar los filtros para explorar cartas específicas.
            </p>
          </div>
        )}

        {/* Filters Only State */}
        {!loading && searchResults.length === 0 && !searchTerm && (selectedType || selectedColor || selectedManaCost) && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Explorando con filtros
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              No se encontraron cartas con los filtros seleccionados. Intenta ajustar los filtros o agregar un término de búsqueda.
            </p>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-gray-600 hover:border-gray-500"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-400">Buscando cartas...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSearch;
