import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para generar UUIDs que funcione en el navegador
export function generateUUID(): string {
  // Verificar si crypto.randomUUID está disponible
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores que no soportan crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Unified card styling utility
export interface CardStyle {
  background: string;
  text: string;
  border: string;
}

export function getCardStyle(colors: string[] | undefined): CardStyle {
  const colorMap: Record<string, CardStyle> = {
    W: { background: "bg-gray-800", text: "text-gray-200", border: "border-gray-600" },
    U: { background: "bg-gray-800", text: "text-gray-200", border: "border-gray-600" },
    B: { background: "bg-gray-900", text: "text-gray-100", border: "border-gray-800" },
    R: { background: "bg-gray-800", text: "text-gray-200", border: "border-gray-600" },
    G: { background: "bg-gray-800", text: "text-gray-200", border: "border-gray-600" },
  };

  if (!colors || colors.length === 0) {
    return { background: "bg-gray-800", text: "text-gray-300", border: "border-gray-700" };
  }

  if (colors.length === 1) {
    return colorMap[colors[0]] || colorMap.W;
  }

  return { background: "bg-gray-800", text: "text-gray-200", border: "border-gray-600" };
}

// Card type utilities
export function getPrimaryType(typeLine: string | undefined): string {
  if (!typeLine) return "Other";

  const types = [
    "Creature",
    "Instant",
    "Sorcery",
    "Enchantment",
    "Artifact",
    "Planeswalker",
    "Land",
  ];

  for (const type of types) {
    if (typeLine.includes(type)) return type;
  }

  return "Other";
}

export function getTypeOrder(type: string): number {
  const order: Record<string, number> = {
    Land: 1,
    Creature: 2,
    Instant: 3,
    Sorcery: 4,
    Enchantment: 5,
    Artifact: 6,
    Planeswalker: 7,
    Other: 8,
  };
  return order[type] || 8;
}

export function getManaSymbols(manaCost: string | undefined): string[] {
  if (!manaCost) return [];
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];
  return symbols.map((symbol) => symbol.slice(1, -1));
}
