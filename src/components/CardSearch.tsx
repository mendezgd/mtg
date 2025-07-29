"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableCard } from "@/types/card";
import { useCardSearch } from "@/hooks/use-card-search";
import { CardGrid } from "@/components/ui/card-grid";
import { SearchFilters } from "@/components/ui/search-filters";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface CardSearchProps {
  addCardToDeck: (card: SearchableCard) => void;
  onCardPreview: (card: SearchableCard) => void;
}

const CardSearch: React.FC<CardSearchProps> = ({ addCardToDeck, onCardPreview }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedManaCost, setSelectedManaCost] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchResults,
    loading,
    error,
    currentPage,
    totalPages,
    searchCards,
    clearResults,
  } = useCardSearch();

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;

      setIsSearching(true);
      try {
        await searchCards(searchTerm, {
          type: selectedType,
          color: selectedColor,
          manaCost: selectedManaCost,
        });
      } finally {
        setIsSearching(false);
      }
    },
    [searchTerm, selectedType, selectedColor, selectedManaCost, searchCards]
  );

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedColor("");
    setSelectedManaCost("");
    clearResults();
  }, [clearResults]);

  const handleCardClick = useCallback(
    (card: SearchableCard) => {
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
          onTypeChange={setSelectedType}
          onColorChange={setSelectedColor}
          onManaCostChange={setSelectedManaCost}
        />

        {/* Search Actions */}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={loading || !searchTerm.trim()}
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
                Buscar Cartas
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
        </div>
      )}

      {/* Results Section */}
      <div className="flex-1 overflow-hidden">
        {searchResults.length > 0 && (
          <div className="h-full flex flex-col">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-900/30 rounded-lg">
              <span className="text-sm text-gray-300">
                {searchResults.length} cartas encontradas
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => searchCards(searchTerm, {
                        type: selectedType,
                        color: selectedColor,
                        manaCost: selectedManaCost,
                      }, currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="w-8 h-8 p-0"
                    >
                      ←
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => searchCards(searchTerm, {
                        type: selectedType,
                        color: selectedColor,
                        manaCost: selectedManaCost,
                      }, currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="w-8 h-8 p-0"
                    >
                      →
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-auto">
              <CardGrid
                cards={searchResults}
                onCardClick={handleCardClick}
                onCardPreview={onCardPreview}
                onAddToDeck={handleAddToDeck}
                className="animate-fade-in"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchTerm && (
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

        {/* Initial State */}
        {!loading && searchResults.length === 0 && !searchTerm && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Busca tu próxima carta
            </h3>
            <p className="text-gray-400 max-w-md">
              Ingresa el nombre de una carta, tipo, color o cualquier término para comenzar tu búsqueda
            </p>
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
