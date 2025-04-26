"use client";

import React, { useState, useCallback, useEffect } from "react";
import CardSearch from "@/components/CardSearch";
import dynamic from "next/dynamic";
import { Card } from "@/components/CardList";

interface Deck {
  id: string;
  name: string;
  cards: { [cardName: string]: { card: Card; count: number } };
}

// Carga diferida del componente DeckBuilder
const DeckBuilder = dynamic(() => import("@/components/DeckBuilder"), {
  ssr: false,
  loading: () => (
    <div className="text-gray-400">Cargando constructor de mazos...</div>
  ),
});

const DeckBuilderPage: React.FC = () => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [previewedCard, setPreviewedCard] = useState<Card | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const handleRenameDeck = useCallback(
    (deckId: string, newName: string) => {
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId ? { ...deck, name: newName } : deck
        )
      );
    },
    [setDecks]
  );

  useEffect(() => {
    setIsMounted(true);
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      // Usar isMounted
      localStorage.setItem("decks", JSON.stringify(decks));
    }
  }, [decks, isMounted]);

  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      if (window.confirm("¿Estás seguro de eliminar este mazo?")) {
        setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
        if (selectedDeckId === deckId) {
          setSelectedDeckId(null);
        }
      }
    },
    [selectedDeckId, setDecks, setSelectedDeckId]
  );

  const isBasicLand = useCallback((card: Card) => {
    return card.type_line?.includes("Basic Land");
  }, []);

  const addCardToDeck = useCallback(
    (card: Card) => {
      if (!isMounted || !selectedDeckId) {
        alert("Por favor selecciona un mazo");
        return;
      }

      setDecks((prevDecks) => {
        return prevDecks.map((deck) => {
          if (deck.id === selectedDeckId) {
            const currentCount = deck.cards[card.name]?.count || 0;
            const isLand = isBasicLand(card);

            if (!isLand && currentCount >= 4) {
              alert("Máximo 4 copias permitidas para cartas no básicas");
              return deck;
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
          }
          return deck;
        });
      });
    },
    [selectedDeckId, isMounted, isBasicLand]
  );

  const removeCardFromDeck = useCallback(
    (cardName: string) => {
      if (!isMounted || !selectedDeckId) return;

      setDecks((prevDecks) => {
        return prevDecks.map((deck) => {
          if (deck.id === selectedDeckId) {
            const currentCount = deck.cards[cardName]?.count || 0;

            if (currentCount <= 1) {
              const newCards = { ...deck.cards };
              delete newCards[cardName];
              return { ...deck, cards: newCards };
            }

            return {
              ...deck,
              cards: {
                ...deck.cards,
                [cardName]: {
                  ...deck.cards[cardName],
                  count: currentCount - 1,
                },
              },
            };
          }
          return deck;
        });
      });
    },
    [selectedDeckId, isMounted]
  );

  const handleCardPreview = useCallback((card: Card) => {
    setPreviewedCard(card);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      {/* Columna de Búsqueda */}
      <div className="w-1/3 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Buscador de Cartas</h2>
        <CardSearch
          addCardToDeck={addCardToDeck}
          onCardPreview={handleCardPreview}
        />
      </div>

      {/* Columna de Vista Previa */}
      <div className="w-1/4 p-4 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Vista Previa</h2>
        {previewedCard ? (
          <div className="animate-fade-in">
            <p className="mb-2 font-semibold">{previewedCard.name}</p>
            {previewedCard.image_uris?.normal && (
              <img
                src={previewedCard.image_uris.normal}
                alt={previewedCard.name}
                className="w-full h-auto rounded-lg shadow-xl"
                loading="lazy"
              />
            )}
            <div className="mt-4 space-y-2">
              {previewedCard.mana_cost && (
                <p className="text-sm">Coste: {previewedCard.mana_cost}</p>
              )}
              {previewedCard.type_line && (
                <p className="text-sm">Tipo: {previewedCard.type_line}</p>
              )}
              {previewedCard.oracle_text && (
                <p className="text-sm italic">{previewedCard.oracle_text}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">
            Selecciona una carta para previsualizar
          </p>
        )}
      </div>

      {/* Columna del Mazo */}
      <div className="w-1/3 p-4">
        <h2 className="text-xl font-bold mb-4">Mi Mazo</h2>
        <DeckBuilder
          decks={decks}
          setDecks={setDecks}
          selectedDeckId={selectedDeckId}
          setSelectedDeckId={setSelectedDeckId}
          removeCardFromDeck={removeCardFromDeck}
          addCardToDeck={addCardToDeck}
          handleDeleteDeck={handleDeleteDeck}
          handleRenameDeck={handleRenameDeck}
        />
      </div>
    </div>
  );
};

export default DeckBuilderPage;
