"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GameBoard } from "./GameBoard";
import { GameCard, DeckCardEntry, Deck } from "@/types/card";

export default function GamePage() {
  const [initialDeck, setInitialDeck] = useState<GameCard[]>([]);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);

  // Load available decks
  useEffect(() => {
    try {
      const savedDecksStr = localStorage.getItem("savedDecks");
      if (savedDecksStr) {
        const parsedDecks = JSON.parse(savedDecksStr);
        if (Array.isArray(parsedDecks)) {
          const validDecks = parsedDecks.filter(
            (deck): deck is Deck =>
              deck &&
              typeof deck === "object" &&
              "id" in deck &&
              "name" in deck &&
              "cards" in deck
          );
          setAvailableDecks(validDecks);

          // If we have decks and no game state, use the first deck as initial deck
          if (validDecks.length > 0 && !localStorage.getItem("gameState")) {
            const firstDeck = validDecks[0];
            const deckArray = Object.values(firstDeck.cards).flatMap(
              (deckCard: DeckCardEntry) =>
                Array(deckCard.count).fill(deckCard.card)
            );
            setInitialDeck(deckArray);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved decks:", error);
    }
  }, []);

  // Load game state if it exists
  useEffect(() => {
    const gameState = localStorage.getItem("gameState");
    if (gameState) {
      try {
        const parsedState = JSON.parse(gameState);
        if (parsedState.players && Array.isArray(parsedState.players)) {
          // Get both players' decks
          const player1Deck = parsedState.players[0].deck;
          const player2Deck = parsedState.players[1].deck;
          if (Array.isArray(player1Deck) && Array.isArray(player2Deck)) {
            // Set both decks in the game state
            setInitialDeck([...player1Deck, ...player2Deck]);
          }
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      }
    }
  }, []);

  if (initialDeck.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-800 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No hay mazo seleccionado</h1>
          <p className="mb-4">
            Por favor, selecciona un mazo en el constructor de mazos.
          </p>
          <button
            onClick={() => (window.location.href = "/deck-builder")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Ir al Constructor de Mazos
          </button>
        </div>
      </div>
    );
  }

  return <GameBoard initialDeck={initialDeck} />;
}
