import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulador de Juego MTG Premodern - En Desarrollo",
  description: "Simulador de juego MTG Premodern en desarrollo. Próximamente funcionalidad completa para jugar partidas de Magic: The Gathering.",
  keywords: ["simulador de juego", "MTG Premodern", "magic the gathering", "juego online", "partidas", "en desarrollo"],
  openGraph: {
    title: "Simulador de Juego MTG Premodern - En Desarrollo",
    description: "Simulador de juego MTG Premodern en desarrollo. Próximamente funcionalidad completa para jugar partidas de Magic: The Gathering.",
    url: "https://mtg-premodern.com/game",
  },
  twitter: {
    title: "Simulador de Juego MTG Premodern - En Desarrollo",
    description: "Simulador de juego MTG Premodern en desarrollo. Próximamente funcionalidad completa para jugar partidas de Magic: The Gathering.",
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 