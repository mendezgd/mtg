import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulador de Juego MTG Premodern",
  description: "Juega partidas completas de Magic: The Gathering Premodern con nuestro simulador avanzado. Interfaz intuitiva y todas las mecánicas del juego.",
  keywords: ["simulador de juego", "MTG Premodern", "magic the gathering", "juego online", "partidas"],
  openGraph: {
    title: "Simulador de Juego MTG Premodern",
    description: "Juega partidas completas de Magic: The Gathering Premodern con nuestro simulador avanzado. Interfaz intuitiva y todas las mecánicas del juego.",
    url: "https://mtg-premodern.com/game",
  },
  twitter: {
    title: "Simulador de Juego MTG Premodern",
    description: "Juega partidas completas de Magic: The Gathering Premodern con nuestro simulador avanzado. Interfaz intuitiva y todas las mecánicas del juego.",
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 