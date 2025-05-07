"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CardData {
  name: string;
  image_uris?: {
    small: string;
  };
}

const GamePage: React.FC = () => {
  const [savedDecks, setSavedDecks] = useState<
    { name: string; cards: CardData[] }[]
  >([]);
  const [selectedDeck, setSelectedDeck] = useState<CardData[] | null>(null);

  // Cargar mazos desde localStorage
  useEffect(() => {
    const decks = localStorage.getItem("savedDecks");
    if (decks) {
      try {
        const parsedDecks = JSON.parse(decks);
        setSavedDecks(parsedDecks);
      } catch (error) {
        console.error("Error parsing saved decks:", error);
      }
    }
  }, []);

  // Manejar selección de mazo
  const handleSelectDeck = (deck: { name: string; cards: CardData[] }) => {
    if (Array.isArray(deck.cards)) {
      setSelectedDeck(deck.cards);
    } else {
      console.error("El mazo seleccionado no tiene un array de cartas válido.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      {/* Botón para volver al Deck Builder */}
      <div className="sticky top-0 z-50 bg-gray-900 p-4 shadow-md">
        <Link href="/deck-builder">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white">
            Volver al Deck Builder
          </Button>
        </Link>
      </div>

      {!selectedDeck ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h1 className="text-2xl mb-4">Selecciona un Mazo</h1>
          {savedDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDecks.map((deck, index) => (
                <Button
                  key={index}
                  onClick={() => handleSelectDeck(deck)}
                  className="p-1 bg-emerald-700 rounded shadow hover:bg-emerald-600 text-white"
                >
                  {deck.name || `Deck ${index + 1}`} ({deck.cards.length}{" "}
                  cartas)
                </Button>
              ))}
            </div>
          ) : (
            <div>
              <p className="mb-4">
                ¡No se encontraron mazos! Crea uno en el Constructor de Mazos.
              </p>
              <Link href="/deck-builder">
                <Button className="bg-blue-500 hover:bg-blue-700 text-white">
                  Ir al Constructor de Mazos
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          {/* Área de Juego */}
          <GameBoard initialDeck={selectedDeck} />
        </div>
      )}
    </div>
  );
};

export default GamePage;
