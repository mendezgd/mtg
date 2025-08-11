import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MTG Life Counter",
  description: "Contador de vidas para Magic que pidió el chudo",
};

export default function LifeCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 