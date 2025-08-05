import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MTG Life Counter",
  description: "Contador de vidas para Magic: The Gathering",
};

export default function LifeCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 