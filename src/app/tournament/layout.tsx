import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torneos Suizos MTG Premodern",
  description:
    "Organiza y participa en torneos suizos de Magic: The Gathering Premodern. Gestión avanzada de brackets, emparejamientos y resultados.",
  keywords: [
    "torneos suizos",
    "MTG Premodern",
    "brackets",
    "emparejamientos",
    "competencia",
  ],
  openGraph: {
    title: "Torneos Suizos MTG Premodern",
    description:
      "Organiza y participa en torneos suizos de Magic: The Gathering Premodern. Gestión avanzada de brackets, emparejamientos y resultados.",
    url: "https://mtgpox.com/tournament",
  },
  twitter: {
    title: "Torneos Suizos MTG Premodern",
    description:
      "Organiza y participa en torneos suizos de Magic: The Gathering Premodern. Gestión avanzada de brackets, emparejamientos y resultados.",
  },
};

export default function TournamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
