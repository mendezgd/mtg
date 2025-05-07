"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import axios from "axios";

export interface CardData {
  name: string;
  image_uris?: {
    small: string;
  };
}

const cardStyle = {
  width: "70px",
  height: "98px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "9px",
  fontWeight: "bold",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  cursor: "pointer",
  userSelect: "none",
  marginBottom: "3px",
};

const zoomedCardStyle = {
  width: "140px",
  height: "196px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "18px",
  fontWeight: "bold",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  cursor: "pointer",
  userSelect: "none",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1000,
};

export const GameBoard: React.FC<{ initialDeck: CardData[] }> = ({
  initialDeck,
}) => {
  const [playerDeck, setPlayerDeck] = useState<CardData[]>(
    Array.isArray(initialDeck) ? initialDeck : []
  );
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);
  const [playerPlayArea, setPlayerPlayArea] = useState<CardData[]>([]);
  const [playerLandArea, setPlayerLandArea] = useState<CardData[]>([]);

  const [opponentDeck, setOpponentDeck] = useState<CardData[]>(
    Array.isArray(initialDeck) ? [...initialDeck] : []
  );
  const [opponentHand, setOpponentHand] = useState<CardData[]>([]);
  const [opponentPlayArea, setOpponentPlayArea] = useState<CardData[]>([]);
  const [opponentLandArea, setOpponentLandArea] = useState<CardData[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [cardRotation, setCardRotation] = useState<{ [key: string]: number }>(
    {}
  );
  const [zoomedCard, setZoomedCard] = useState<CardData | null>(null);

  const playAreaRef = useRef<HTMLDivElement>(null);

  const drawCard = (target: "player" | "opponent") => {
    if (target === "player") {
      if (playerDeck.length > 0) {
        const card = playerDeck[0];
        setPlayerHand([...playerHand, card]);
        setPlayerDeck(playerDeck.slice(1));
      }
    } else {
      if (opponentDeck.length > 0) {
        const card = opponentDeck[0];
        setOpponentHand([...opponentHand, card]);
        setOpponentDeck(opponentDeck.slice(1));
      }
    }
  };

  const playCard = (
    card: CardData,
    target: "player" | "opponent",
    area: "play" | "land"
  ) => {
    if (target === "player") {
      if (area === "play") {
        setPlayerPlayArea([...playerPlayArea, card]);
      } else {
        setPlayerLandArea([...playerLandArea, card]);
      }
      setPlayerHand(playerHand.filter((c) => c !== card));
    } else {
      if (area === "play") {
        setOpponentPlayArea([...opponentPlayArea, card]);
      } else {
        setOpponentLandArea([...opponentLandArea, card]);
      }
      setOpponentHand(opponentHand.filter((c) => c !== card));
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    card: CardData
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(card));
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropToPlayArea = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData("text/plain");
    if (cardData) {
      const card: CardData = JSON.parse(cardData);
      playCard(card, "player", "play");
    }
    setIsDragging(false);
  };

  const handleDropToLandArea = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData("text/plain");
    if (cardData) {
      const card: CardData = JSON.parse(cardData);
      playCard(card, "player", "land");
    }
    setIsDragging(false);
  };

  const handleDropToHand = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData("text/plain");
    if (cardData) {
      const card: CardData = JSON.parse(cardData);
      setPlayerHand([...playerHand, card]);
    }
    setIsDragging(false);
  };

  const toggleCardRotation = (card: CardData) => {
    setCardRotation((prevRotation) => ({
      ...prevRotation,
      [card.name]: (prevRotation[card.name] || 0) === 0 ? 90 : 0,
    }));
  };

  const handleCardContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    card: CardData
  ) => {
    e.preventDefault();
    setZoomedCard(card);
  };

  const handleCloseZoom = () => {
    setZoomedCard(null);
  };

  const remainingPlayerCards = playerDeck.length;
  const remainingOpponentCards = opponentDeck.length;

  const [cardImages, setCardImages] = useState<Record<string, string | null>>(
    {}
  );
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );

  const getCardImage = async (cardName: string): Promise<string | null> => {
    if (cardImages[cardName]) {
      return cardImages[cardName]!;
    }
    if (loadingImages[cardName]) {
      return null;
    }

    setLoadingImages((prev) => ({ ...prev, [cardName]: true }));
    try {
      const response = await axios.get(
        `https://api.scryfall.com/cards/named?fuzzy=${cardName}`
      );
      const imageUrl = response.data.image_uris?.small;
      setCardImages((prevImages) => ({
        ...prevImages,
        [cardName]: imageUrl || null,
      }));
      return imageUrl || null;
    } catch (error) {
      console.error("Error fetching card image for", cardName, ":", error);
      setCardImages((prevImages) => ({ ...prevImages, [cardName]: null }));
      return null;
    } finally {
      setLoadingImages((prev) => ({ ...prev, [cardName]: false }));
    }
  };

  useEffect(() => {
    const allCards = [...playerHand, ...playerPlayArea, ...playerLandArea];
    allCards.forEach((card) => {
      if (card && card.name && !cardImages[card.name]) {
        getCardImage(card.name);
      }
    });
  }, [playerHand, playerPlayArea, playerLandArea]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 text-white">
      {/* Top: Opponent Area */}
      <div className="flex justify-between p-2">
        {/* Opponent's Hand Area (Hidden) */}
        <div className="flex overflow-x-auto">
          {opponentHand.map((_, index) => (
            <div
              key={index}
              style={cardStyle as React.CSSProperties}
              className="mr-1"
            >
              {/* Back of card or hidden representation */}
              Opponent Card
            </div>
          ))}
        </div>
      </div>

      {/* Center: Play Area */}
      <div
        className="flex-grow p-2 flex justify-center items-center"
        onDragOver={handleDragOver}
        ref={playAreaRef}
      >
        <div className="w-full h-full flex flex-col">
          {/* Opponent Play Area */}
          <div className="flex-grow p-2 flex justify-center items-center border-2 border-ddd border-dashed">
            <div className="play-area text-center">
              <h2 className="text-xl mb-2 text-7DF9FF">Opponent Play Area</h2>
              <div className="flex flex-wrap justify-center">
                {opponentPlayArea.map((card, index) => (
                  <div
                    key={index}
                    style={
                      {
                        ...cardStyle,
                        transform: `rotate(${cardRotation[card.name] || 0}deg)`,
                        transition: "transform 0.3s ease-in-out",
                      } as React.CSSProperties
                    }
                    onContextMenu={(e) => handleCardContextMenu(e, card)}
                  >
                    {card.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Player Play Area */}
          <div
            className="flex-grow p-2 flex justify-center items-center border-2 border-ddd border-dashed"
            onDrop={handleDropToPlayArea}
            onDragOver={handleDragOver}
          >
            <div className="play-area text-center">
              <h2 className="text-xl mb-2 text-7DF9FF">Player Play Area</h2>
              <div className="flex flex-wrap justify-center">
                {playerPlayArea.map((card, index) => (
                  <div
                    key={index}
                    style={{
                      ...cardStyle,
                      transform: `rotate(${cardRotation[card.name] || 0}deg)`,
                      transition: "transform 0.3s ease-in-out",
                      userSelect: "none" as const,
                    }}
                    onClick={() => toggleCardRotation(card)}
                    onContextMenu={(e) => handleCardContextMenu(e, card)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                  >
                    {loadingImages[card.name] ? (
                      <div className="w-full h-full bg-gray-300 animate-pulse rounded" />
                    ) : cardImages[card.name] ? (
                      <img
                        src={cardImages[card.name]!}
                        alt={card.name}
                        className="w-full h-full object-cover rounded"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      />
                    ) : (
                      <div className="text-center">Image Not Found</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Player Hand Area */}
      <div
        className="p-2 absolute bottom-0 left-0 w-full"
        onDragOver={handleDragOver}
        onDrop={handleDropToHand}
      >
        <h2 className="text-lg mb-1 text-7DF9FF">Hand</h2>
        <div className="flex overflow-x-auto">
          {playerHand.map((card, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, card)}
              onDoubleClick={() => playCard(card, "player", "play")}
              style={cardStyle as React.CSSProperties}
              className="mr-1 hover:scale-110 transition-transform duration-200"
              title={card.name}
            >
              {loadingImages[card.name] ? (
                <div className="w-full h-full bg-gray-300 animate-pulse rounded" />
              ) : cardImages[card.name] ? (
                <img
                  src={cardImages[card.name]!}
                  alt={card.name}
                  className="w-full h-full object-cover rounded"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              ) : (
                <div className="text-center text-xs">Image Not Found</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {zoomedCard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={handleCloseZoom}
        >
          <div
            style={zoomedCardStyle as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingImages[zoomedCard.name] ? (
              <div className="w-full h-full bg-gray-300 animate-pulse rounded" />
            ) : cardImages[zoomedCard.name] ? (
              <img
                src={cardImages[zoomedCard.name]!}
                alt={zoomedCard.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-center">Image Not Found</div>
            )}
            <div className="absolute bottom-2 left-2 text-white text-sm">
              {zoomedCard.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GamePage: React.FC = () => {
  const [savedDecks, setSavedDecks] = useState<
    { name: string; cards: CardData[] }[]
  >([]);
  const [selectedDeck, setSelectedDeck] = useState<CardData[] | null>(null);

  // Cargar mazos desde localStorage
  useEffect(() => {
    const decks = localStorage.getItem("savedDecks");
    console.log("Decks from localStorage:", decks); // Debugging
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
      setSelectedDeck(deck.cards); // Pasar solo las cartas al área de juego
    } else {
      console.error("El mazo seleccionado no tiene un array de cartas válido.");
      setSelectedDeck([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
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
              <Link href="/deck-builder">
                <Button className="bg-blue-500 hover:bg-blue-700 text-white">
                  Volver al Deck Builder
                </Button>
              </Link>
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
          <GameBoard initialDeck={selectedDeck || []} />
        </div>
      )}
    </div>
  );
};

export default GamePage;
