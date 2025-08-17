import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ui/error-boundary";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "MTG Premodern - Constructor de Mazos y Simulador de Juego",
    template: "%s | MTG Premodern",
  },
  description:
    "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering. Busca cartas, construye mazos y juega online.",
  keywords: [
    "MTG",
    "Magic: The Gathering",
    "Premodern",
    "constructor de mazos",
    "simulador de juego",
    "torneos suizos",
    "cartas magic",
    "deck builder",
    "game simulator",
  ],
  authors: [{ name: "MTG Premodern Team" }],
  creator: "MTG Premodern",
  publisher: "MTG Premodern",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.mtgpox.com/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.mtgpox.com/",
    title: "MTG Premodern - Constructor de Mazos y Simulador de Juego",
    description:
      "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering.",
    siteName: "MTG Premodern",
    images: [
      {
        url: "/images/pixelpox.webp",
        width: 1200,
        height: 630,
        alt: "MTG Premodern - Constructor de Mazos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MTG Premodern - Constructor de Mazos y Simulador de Juego",
    description:
      "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering.",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Primary favicon - ICO format for maximum compatibility */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        {/* PNG favicons for different sizes */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        {/* Apple touch icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Android Chrome icons */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />

        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="format-detection" content="telephone=no" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.scryfall.com" />
        <link rel="preconnect" href="https://cards.scryfall.io" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "MTG Premodern",
              description:
                "Constructor de mazos MTG Premodern, simulador de juego, torneos suizos y herramientas para jugadores de Magic: The Gathering.",
              url: "https://www.mtgpox.com",
              applicationCategory: "Game",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "MTG Premodern Team",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      >
        <ErrorBoundary>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
