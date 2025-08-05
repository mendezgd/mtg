"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

import { useLocalStorage } from "../hooks/use-local-storage";
import { RotateCcw, Crown } from "lucide-react";

interface PlayerState {
  life: number;
  name: string;
  color: "white" | "blue" | "black" | "red" | "green" | "colorless";
  isActive: boolean;
}

interface GameState {
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  landscapeMode: boolean;
}

const LifeCounter: React.FC = () => {
  // Estado principal del juego
  const [gameState, setGameState] = useLocalStorage<GameState>(
    "mtg-life-counter",
    {
      players: {
        player1: {
          life: 20,
          name: "villano",
          color: "blue",
          isActive: false,
        },
        player2: {
          life: 20,
          name: "yo",
          color: "red",
          isActive: false,
        },
      },
      landscapeMode: false,
    }
  );

  // Estado local para animaciones
  const [animations, setAnimations] = useState({
    player1: { life: false },
    player2: { life: false },
  });

  // Colores MTG oficiales
  const mtgColors = {
    white: { bg: "bg-white", text: "text-gray-800", border: "border-gray-300" },
    blue: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
    black: { bg: "bg-gray-800", text: "text-white", border: "border-gray-900" },
    red: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
    green: {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-600",
    },
    colorless: {
      bg: "bg-gray-400",
      text: "text-white",
      border: "border-gray-500",
    },
  };

  // Función para resetear partida
  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      players: {
        player1: {
          life: 20,
          name: "villano",
          color: "blue",
          isActive: false,
        },
        player2: {
          life: 20,
          name: "yo",
          color: "red",
          isActive: false,
        },
      },
    }));
  }, [setGameState]);

  // Detectar orientación de pantalla
  useEffect(() => {
    const handleOrientationChange = () => {
      setGameState((prev) => ({
        ...prev,
        landscapeMode: window.innerWidth > window.innerHeight,
      }));
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [setGameState]);

  // Función para animar cambios
  const animateChange = useCallback((player: "player1" | "player2") => {
    setAnimations((prev) => ({
      ...prev,
      [player]: { life: true },
    }));

    setTimeout(() => {
      setAnimations((prev) => ({
        ...prev,
        [player]: { life: false },
      }));
    }, 300);
  }, []);

  // Función para cambiar vida
  const changeLife = useCallback(
    (player: "player1" | "player2", amount: number) => {
      setGameState((prev) => ({
        ...prev,
        players: {
          ...prev.players,
          [player]: {
            ...prev.players[player],
            life: Math.max(0, prev.players[player].life + amount),
          },
        },
      }));

      animateChange(player);
    },
    [setGameState, animateChange]
  );

  // Componente para mostrar jugador
  const PlayerCard = ({
    player,
    playerData,
  }: {
    player: "player1" | "player2";
    playerData: PlayerState;
  }) => {
    const isAnimating = animations[player].life;
    const colorConfig = mtgColors[playerData.color];
         const backgroundImage =
       player === "player1" ? "/images/chudixd.webp" : "/images/chudix.webp";

    return (
      <Card className="transition-all duration-300 relative overflow-hidden bg-gray-800 border-gray-700">
                 {/* Imagen de fondo con fallback */}
         <div 
           className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
           style={{ 
             backgroundImage: `url(${backgroundImage})`,
             backgroundColor: player === "player1" ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 68, 68, 0.1)"
           }}
         />
         {/* Fallback de color de fondo */}
         <div 
           className="absolute inset-0 opacity-10"
           style={{
             backgroundColor: player === "player1" ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)"
           }}
         />

                 <CardHeader className="pb-4 relative z-10">
           <div className="flex items-center justify-center">
             <CardTitle className="text-lg font-bold text-white">
               {playerData.name}
             </CardTitle>
           </div>
         </CardHeader>
        <CardContent className="relative z-10">
          {/* Contador de vida principal */}
          <div className="text-center relative h-64 flex items-center justify-center">
                         <div
               className={`text-9xl font-light tracking-wider text-white transition-all duration-300 ${
                 isAnimating ? "scale-110" : "scale-100"
               }`}
             >
               {playerData.life}
             </div>
            {/* Botones invisibles que cubren la mitad izquierda y derecha */}
            <div className="absolute inset-0 flex">
                             <button
                 onClick={() => changeLife(player, -1)}
                 className="w-1/2 h-full bg-transparent hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center group"
                 aria-label="Reducir vida"
               >
                 <span className="text-5xl font-light tracking-widest text-red-400/60 group-hover:text-red-300 group-hover:scale-125 transition-all duration-300">
                   −
                 </span>
               </button>
               <button
                 onClick={() => changeLife(player, 1)}
                 className="w-1/2 h-full bg-transparent hover:bg-green-500/20 transition-all duration-300 flex items-center justify-center group"
                 aria-label="Aumentar vida"
               >
                 <span className="text-5xl font-light tracking-widest text-green-400/60 group-hover:text-green-300 group-hover:scale-125 transition-all duration-300">
                   +
                 </span>
               </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">MTG Life Counter</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="destructive"
              onClick={resetGame}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nueva Partida</span>
            </Button>
          </div>
        </div>

        {/* Contadores principales */}
        <div
          className={`grid gap-8 ${
            gameState.landscapeMode
              ? "grid-cols-2"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          <PlayerCard player="player1" playerData={gameState.players.player1} />
          <PlayerCard player="player2" playerData={gameState.players.player2} />
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          {gameState.landscapeMode && (
            <Badge variant="outline" className="text-sm">
              Modo Landscape
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifeCounter;
