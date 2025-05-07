import React, { useState, useEffect } from "react";

export interface CardData {
  name: string;
  image_uris?: {
    small: string;
    normal?: string;
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

// Función para mezclar el mazo (Fisher-Yates Shuffle)
const shuffleDeck = (deck: CardData[]): CardData[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const GameBoard: React.FC<{ initialDeck: CardData[] }> = ({
  initialDeck,
}) => {
  const [playerDeck, setPlayerDeck] = useState<CardData[]>([]);
  const [playerHand, setPlayerHand] = useState<CardData[]>([]);

  // Mezclar el mazo al cargar el componente
  useEffect(() => {
    console.log("Initial Deck:", initialDeck); // Depuración
    const shuffledDeck = shuffleDeck(initialDeck);
    setPlayerDeck(shuffledDeck);
  }, [initialDeck]);

  // Función para robar una carta del mazo
  const drawCardFromDeck = () => {
    if (playerDeck.length > 0) {
      const card = playerDeck[0];
      setPlayerHand([...playerHand, card]);
      setPlayerDeck(playerDeck.slice(1));
    } else {
      console.warn("El mazo está vacío.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 text-white">
      {/* Representación del mazo */}
      <div className="flex justify-center items-center mt-4">
        <div
          className="w-24 h-36 bg-gray-700 rounded-lg shadow-lg flex justify-center items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={drawCardFromDeck}
          title="Haz clic para robar una carta"
        >
          <p className="text-white text-center">Mazo ({playerDeck.length})</p>
        </div>
      </div>

      {/* Área de la mano del jugador */}
      <div className="p-2 absolute bottom-0 left-0 w-full">
        <h2 className="text-lg mb-1 text-7DF9FF">Mano</h2>
        <div className="flex overflow-x-auto">
          {playerHand.map((card, index) => {
            console.log("Card:", card); // Depuración
            console.log("Card Image URL:", card.image_uris?.normal); // Depuración
            return (
              <div
                key={index}
                style={cardStyle as React.CSSProperties}
                className="mr-1 hover:scale-110 transition-transform duration-200"
                title={card.name}
              >
                {card.image_uris?.normal ? (
                  <img
                    src={card.image_uris.normal}
                    alt={card.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-center text-xs bg-gray-600 text-white p-2 rounded">
                    Sin Imagen
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
