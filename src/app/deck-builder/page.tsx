"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Añade esta línea
import CardSearch from "@/components/CardSearch";
import dynamic from "next/dynamic";
import { Card } from "@/components/CardList";
import Image from "next/image";

interface Deck {
  id: string;
  name: string;
  cards: { [cardName: string]: { card: Card; count: number } };
}

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
  const [importText, setImportText] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<{
    valid: Array<{ card: Card; count: number }>;
    invalid: string[];
  }>({ valid: [], invalid: [] });
  const [newDeckName, setNewDeckName] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState<
    "search" | "preview" | "deck" | "import"
  >("search");

  // Efectos de persistencia
  useEffect(() => {
    setIsMounted(true);
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) setDecks(JSON.parse(savedDecks));
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("decks", JSON.stringify(decks));
  }, [decks, isMounted]);

  // Funciones principales
  const isBasicLand = useCallback((card: Card) => {
    return card.type_line?.includes("Basic Land");
  }, []);

  const addCardToDeck = useCallback(
    (card: Card) => {
      if (!isMounted || !selectedDeckId) {
        alert("Por favor selecciona un mazo");
        return;
      }

      setDecks((prevDecks) =>
        prevDecks.map((deck) => {
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
        })
      );
    },
    [selectedDeckId, isMounted, isBasicLand]
  );

  const removeCardFromDeck = useCallback(
    (cardName: string) => {
      if (!isMounted || !selectedDeckId) return;

      setDecks((prevDecks) =>
        prevDecks.map((deck) => {
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
        })
      );
    },
    [selectedDeckId, isMounted]
  );

  // Funciones de gestión de mazos
  const handleDeleteDeck = useCallback(
    (deckId: string) => {
      if (window.confirm("¿Estás seguro de eliminar este mazo?")) {
        setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
        if (selectedDeckId === deckId) setSelectedDeckId(null);
      }
    },
    [selectedDeckId]
  );

  const handleRenameDeck = useCallback((deckId: string, newName: string) => {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId ? { ...deck, name: newName } : deck
      )
    );
  }, []);

  const searchCardByName = useCallback(
    async (name: string): Promise<Card | null> => {
      try {
        // Buscar cualquier versión de la carta
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(
            name
          )}"&unique=prints`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          // Tomar la primera versión que tenga imagen
          const cardData =
            data.data.find((c: any) => c.image_uris?.normal) || data.data[0];

          return {
            id: cardData.id,
            name: cardData.name,
            image_uris: {
              normal:
                cardData.image_uris?.normal ||
                cardData.card_faces?.[0]?.image_uris?.normal ||
                "/default-card.jpg",
            },
            type_line: cardData.type_line,
            oracle_text: cardData.oracle_text,
            mana_cost: cardData.mana_cost,
          } as Card;
        }
        return null;
      } catch (error) {
        console.error("Error buscando carta:", error);
        return null;
      }
    },
    []
  );
  const processImportedDeck = useCallback(
    async (text: string) => {
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const cardMap: { [name: string]: number } = {};
      const invalidCards: string[] = [];

      lines.forEach((line) => {
        const match =
          line.match(/^(\d+)x?\s*(.+)/) || line.match(/^(.+?)\s(\d+)$/);
        if (match) {
          const count = parseInt(match[1] || match[2], 10);
          const name = (match[2] || match[1]).trim();
          cardMap[name] = (cardMap[name] || 0) + count;
        } else {
          invalidCards.push(line.trim());
        }
      });

      const validCards = await Promise.all(
        Object.entries(cardMap).map(async ([name, count]) => {
          const card = await searchCardByName(name);
          return card ? { card, count } : null;
        })
      );

      setImportResults({
        valid: validCards.filter(Boolean) as Array<{
          card: Card;
          count: number;
        }>,
        invalid: invalidCards,
      });
      setImportDialogOpen(true);
    },
    [searchCardByName]
  );

  const createDeckFromImport = useCallback(() => {
    if (!newDeckName.trim() || importResults.valid.length === 0) return;

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: newDeckName,
      cards: importResults.valid.reduce(
        (acc, { card, count }) => ({
          ...acc,
          [card.name]: {
            card,
            count: Math.min(count, isBasicLand(card) ? 1000 : 4),
          },
        }),
        {}
      ),
    };

    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
    setImportDialogOpen(false);
    setImportText("");
    setNewDeckName("");
  }, [importResults, newDeckName, isBasicLand]);

  // Handlers de UI
  const handleCardPreview = useCallback((card: Card) => {
    setPreviewedCard(card);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-800 text-white overflow-hidden">
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex border-b border-gray-700">
        <button
          className={`flex-1 py-2 ${
            activeMobileTab === "search" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveMobileTab("search")}
        >
          Buscar
        </button>
        <button
          className={`flex-1 py-2 ${
            activeMobileTab === "preview" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveMobileTab("preview")}
        >
          Vista
        </button>
        <button
          className={`flex-1 py-2 ${
            activeMobileTab === "deck" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveMobileTab("deck")}
        >
          Mazo
        </button>
        <button
          className={`flex-1 py-2 ${
            activeMobileTab === "import" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveMobileTab("import")}
        >
          Importar
        </button>
      </div>
      {/* Fondo optimizado para mobile */}
      <div
        className={`${
          activeMobileTab === "import" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 border-r border-gray-700 flex flex-col`}
      >
        <div className="mt-4 md:mt-6 flex-1">
          <h3 className="text-md md:text-lg font-semibold mb-2">
            Importar Mazo
          </h3>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`Ejemplo:\n4 Forest\n2 Shock\n3 Dragon`}
            className="w-full h-32 md:h-40 bg-gray-700 rounded-lg p-2 md:p-3 mb-2 focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
          <Button
            onClick={() => processImportedDeck(importText)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-1 md:py-2"
          >
            Importar Mazo
          </Button>
        </div>
      </div>
      {/* Columna de Búsqueda */}
      <div
        className={`${
          activeMobileTab === "search" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 border-r border-gray-700 flex flex-col`}
      >
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          {/* ... mantén el logo y título ... */}
        </div>
        <CardSearch
          addCardToDeck={addCardToDeck}
          onCardPreview={handleCardPreview}
        />

        {/* Solo muestra importación en desktop dentro de esta columna */}
        <div className="hidden md:block mt-4 md:mt-6 flex-1">
          <h3 className="text-md md:text-lg font-semibold mb-2">
            Importar Mazo
          </h3>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`Ejemplo:\n4 Forest\n2 Shock\n3 Dragon`}
            className="w-full h-40 bg-gray-700 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={() => processImportedDeck(importText)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2"
          >
            Importar Mazo
          </Button>
        </div>
      </div>
      {/* Columna de Vista Previa */}
      <div
        className={`${
          activeMobileTab === "preview" ? "block" : "hidden"
        } md:block w-full md:w-1/4 p-2 md:p-4 border-r border-gray-700 overflow-auto`}
      >
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">
          Vista Previa
        </h2>
        {previewedCard ? (
          <div className="animate-fade-in">
            <img
              src={previewedCard.image_uris?.normal || "/default-card.jpg"}
              alt={previewedCard.name}
              className="w-full rounded-lg mb-2"
            />
            <h3 className="font-bold text-md md:text-lg">
              {previewedCard.name}
            </h3>
            <p className="text-xs md:text-sm text-gray-300">
              {previewedCard.type_line}
            </p>
            <p className="mt-1 md:mt-2 text-sm md:text-base">
              {previewedCard.oracle_text}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm md:text-base">
            Selecciona una carta para previsualizar
          </p>
        )}
      </div>
      {/* Columna del Mazo */}
      <div
        className={`${
          activeMobileTab === "deck" ? "block" : "hidden"
        } md:block w-full md:w-1/3 p-2 md:p-4 overflow-auto`}
      >
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Mi Mazo</h2>
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
      {/* Modal de Importación (se mantiene igual) */}
      {importDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg max-w-md w-full mx-2">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              Resultados de Importación
            </h3>
            <div className="mb-4">
              <p className="text-green-400">
                Cartas válidas: {importResults.valid.length}
              </p>
              <p className="text-red-400">
                Errores: {importResults.invalid.length}
              </p>
            </div>
            <input
              type="text"
              placeholder="Nombre del nuevo mazo"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="w-full bg-gray-700 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setImportDialogOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 py-1 md:py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={createDeckFromImport}
                className="bg-blue-600 hover:bg-blue-700 py-1 md:py-2"
                disabled={!newDeckName.trim()}
              >
                Crear Mazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckBuilderPage;
