import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Venta de Proxies de Cartas",
  description:
    "Proxies de cartas MTG Premodern. Compra proxies de calidad para tu mazo.",
};

export default function ProxiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
