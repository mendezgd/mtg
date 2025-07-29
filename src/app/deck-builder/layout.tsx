import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Constructor de Mazos MTG Premodern",
  description: "Construye mazos MTG Premodern con nuestro constructor avanzado. Busca cartas, crea sideboards y optimiza tus estrategias.",
  keywords: ["constructor de mazos", "deck builder", "MTG Premodern", "cartas magic", "sideboard"],
  openGraph: {
    title: "Constructor de Mazos MTG Premodern",
    description: "Construye mazos MTG Premodern con nuestro constructor avanzado. Busca cartas, crea sideboards y optimiza tus estrategias.",
    url: "https://mtg-premodern.com/deck-builder",
  },
  twitter: {
    title: "Constructor de Mazos MTG Premodern",
    description: "Construye mazos MTG Premodern con nuestro constructor avanzado. Busca cartas, crea sideboards y optimiza tus estrategias.",
  },
};

export default function DeckBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 