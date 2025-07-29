import { useState, useCallback, useEffect } from "react";
import { Deck, DeckCard } from "@/types/card";
import { generateUUID } from "@/lib/utils";
import { useLocalStorage } from "./use-local-storage";

interface UseDeckManagementReturn {
  decks: Deck[];
  selectedDeckId: string | null;
  selectedDeck: Deck | undefined;
  createDeck: (name: string) => void;
  deleteDeck: (deckId: string) => void;
  renameDeck: (deckId: string, newName: string) => void;
  selectDeck: (deckId: string | null) => void;
  addCardToDeck: (card: DeckCard) => void;
  removeCardFromDeck: (cardName: string) => void;
  addCardToSideboard: (card: DeckCard) => void;
  removeCardFromSideboard: (cardName: string) => void;
  getTotalCards: (deck: Deck) => number;
  isBasicLand: (card: DeckCard) => boolean;
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

const STORAGE_KEY = "savedDecks";

export const useDeckManagement = (): UseDeckManagementReturn => {
  const [decks, setDecks] = useLocalStorage<Deck[]>(STORAGE_KEY, []);
  const [selectedDeckId, setSelectedDeckId] = useLocalStorage<string | null>("selectedDeckId", null);

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);

  const isBasicLand = useCallback((card: DeckCard) => {
    // Check for basic lands more comprehensively
    const basicLandNames = [
      "Forest", "Island", "Mountain", "Plains", "Swamp",
      "Snow-Covered Forest", "Snow-Covered Island", "Snow-Covered Mountain", 
      "Snow-Covered Plains", "Snow-Covered Swamp"
    ];
    
    return basicLandNames.includes(card.name) || 
           card.type_line?.includes("Basic Land") || 
           false;
  }, []);

  const createDeck = useCallback((name: string) => {
    if (!name.trim()) return;
    
    const newDeck: Deck = {
      id: generateUUID(),
      name: name.trim(),
      cards: {},
    };
    
    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks((prev) => {
      const newDecks = prev.filter((deck) => deck.id !== deckId);
      return newDecks;
    });
    
    // Clear selection if deleted deck was selected
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
    }
  }, [selectedDeckId]);

  const renameDeck = useCallback((deckId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId ? { ...deck, name: newName.trim() } : deck
      )
    );
  }, []);

  const selectDeck = useCallback((deckId: string | null) => {
    setSelectedDeckId(deckId);
  }, []);

  const addCardToDeck = useCallback((card: DeckCard) => {
    if (!selectedDeckId) return;

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;

        const currentCount = deck.cards[card.name]?.count || 0;
        const isLand = isBasicLand(card);

        if (!isLand && currentCount >= 4) {
          return deck; // Don't add more than 4 copies of non-basic cards
        }

        return {
          ...deck,
          cards: {
            ...deck.cards,
            [card.name]: {
              card,
              count: Math.min(currentCount + 1, isLand ? 1000 : 4),
            },
          },
        };
      })
    );
  }, [selectedDeckId, isBasicLand]);

  const removeCardFromDeck = useCallback((cardName: string) => {
    if (!selectedDeckId) return;

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;

        const currentEntry = deck.cards[cardName];
        if (!currentEntry) return deck;

        if (currentEntry.count <= 1) {
          const { [cardName]: removed, ...remainingCards } = deck.cards;
          return { ...deck, cards: remainingCards };
        }

        return {
          ...deck,
          cards: {
            ...deck.cards,
            [cardName]: {
              ...currentEntry,
              count: currentEntry.count - 1,
            },
          },
        };
      })
    );
  }, [selectedDeckId]);

  const addCardToSideboard = useCallback((card: DeckCard) => {
    if (!selectedDeckId) return;

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;

        const currentCount = deck.sideboard?.[card.name]?.count || 0;
        const isLand = isBasicLand(card);

        if (!isLand && currentCount >= 4) {
          return deck;
        }

        return {
          ...deck,
          sideboard: {
            ...deck.sideboard,
            [card.name]: {
              card,
              count: Math.min(currentCount + 1, isLand ? 1000 : 4),
            },
          },
        };
      })
    );
  }, [selectedDeckId, isBasicLand]);

  const removeCardFromSideboard = useCallback((cardName: string) => {
    if (!selectedDeckId) return;

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;

        const currentEntry = deck.sideboard?.[cardName];
        if (!currentEntry) return deck;

        if (currentEntry.count <= 1) {
          const { [cardName]: removed, ...remainingCards } = deck.sideboard || {};
          return { ...deck, sideboard: remainingCards };
        }

        return {
          ...deck,
          sideboard: {
            ...deck.sideboard,
            [cardName]: {
              ...currentEntry,
              count: currentEntry.count - 1,
            },
          },
        };
      })
    );
  }, [selectedDeckId]);

  const getTotalCards = useCallback((deck: Deck) => {
    return Object.values(deck.cards).reduce((acc, { count }) => acc + count, 0);
  }, []);

  return {
    decks,
    selectedDeckId,
    selectedDeck,
    createDeck,
    deleteDeck,
    renameDeck,
    selectDeck,
    addCardToDeck,
    removeCardFromDeck,
    addCardToSideboard,
    removeCardFromSideboard,
    getTotalCards,
    isBasicLand,
    setDecks,
  };
}; 