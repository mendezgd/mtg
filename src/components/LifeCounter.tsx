"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

import { useLocalStorage } from "../hooks/use-local-storage";
import { useSound } from "../hooks/use-sound";
import { RotateCcw, Crown, Volume2, VolumeX } from "lucide-react";

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
  // Hook para sonidos
  const { playLifeGain, playLifeLoss, playReset, isMuted, toggleMute } =
    useSound();

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
    playReset();
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
  }, [setGameState, playReset]);

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
      // Reproducir sonido según el tipo de cambio
      if (amount > 0) {
        playLifeGain();
      } else if (amount < 0) {
        playLifeLoss();
      }

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
    [setGameState, animateChange, playLifeGain, playLifeLoss]
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
      player === "player1"
        ? "/api/local-image?name=chudixd.jpg"
        : "/api/local-image?name=chudix.jpg";

    return (
      <Card className="transition-all duration-300 relative overflow-hidden bg-gray-800 border-gray-700 h-full w-full">
        {/* Imagen de fondo con fallback */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundColor:
              player === "player1"
                ? "rgba(59, 130, 246, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
          }}
          onError={(e) => {
            // Si la imagen falla, ocultar el elemento
            e.currentTarget.style.display = "none";
          }}
        />
        {/* Fallback de color de fondo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundColor:
              player === "player1" ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)",
          }}
        />

        <CardHeader className="pb-4 relative z-10 h-16 flex items-center justify-center">
          <div className="flex items-center justify-center">
            <CardTitle className="text-lg font-bold text-white truncate max-w-full">
              {playerData.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 flex-1 flex items-center justify-center mt-32">
          {/* Contador de vida principal */}
          <div className="text-center relative w-full h-48 flex items-center justify-center">
            <div
              className={`text-8xl md:text-9xl font-light tracking-wider text-white transition-all duration-300 ${
                isAnimating ? "scale-110" : "scale-100"
              }`}
            >
              {playerData.life}
            </div>
          </div>

          {/* Botones invisibles que cubren toda la tarjeta */}
          <div className="absolute inset-0 flex">
            <button
              onClick={() => changeLife(player, -1)}
              className="w-1/2 h-64 bg-transparent hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center group"
              aria-label="Reducir vida"
            >
              <span className="text-2xl md:text-3xl font-light tracking-widest text-red-400/40 group-hover:text-red-300 group-hover:scale-125 transition-all duration-300 -mt-16">
                −
              </span>
            </button>
            <button
              onClick={() => changeLife(player, 1)}
              className="w-1/2 h-64 bg-transparent hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center group"
              aria-label="Aumentar vida"
            >
              <span className="text-2xl md:text-3xl font-light tracking-widest text-green-400/40 group-hover:text-green-300 group-hover:scale-125 transition-all duration-300 -mt-16">
                +
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Botones en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Botón de mute/unmute */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="bg-gray-800/80 backdrop-blur-sm border-gray-600 hover:bg-gray-700/80"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        {/* Botón de reset */}
        <Button
          variant="destructive"
          size="icon"
          onClick={resetGame}
          className="flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-screen w-full">
        {/* Header */}
        {/* Contadores principales */}
        <div
          className={`h-full w-full grid ${
            gameState.landscapeMode
              ? "grid-cols-2"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          <PlayerCard player="player1" playerData={gameState.players.player1} />
          <PlayerCard player="player2" playerData={gameState.players.player2} />
        </div>
      </div>
    </div>
  );
};

export default LifeCounter;
