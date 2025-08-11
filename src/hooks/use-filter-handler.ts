import { useState, useCallback } from "react";

export interface SearchFilters {
  type: string;
  color: string;
  manaCost: string;
  basicLands: string;
}

export interface UseFilterHandlerReturn {
  filters: SearchFilters;
  updateFilter: (key: keyof SearchFilters, value: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export const useFilterHandler = (
  searchTerm: string,
  performSearch: (term: string, filters: SearchFilters) => Promise<void>
): UseFilterHandlerReturn => {
  const [filters, setFilters] = useState<SearchFilters>({
    type: "",
    color: "",
    manaCost: "",
    basicLands: "",
  });

  const updateFilter = useCallback(
    (key: keyof SearchFilters, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      performSearch(searchTerm, newFilters);
    },
    [searchTerm, filters, performSearch]
  );

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      type: "",
      color: "",
      manaCost: "",
      basicLands: "",
    };
    setFilters(clearedFilters);
    performSearch(searchTerm, clearedFilters);
  }, [searchTerm, performSearch]);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(filter => filter.trim() !== "");
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
};
