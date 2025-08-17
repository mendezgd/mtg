"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Library, 
  Gamepad2, 
  Trophy, 
  Heart,
  Menu,
  X,
  Globe
} from "lucide-react";
import { useState } from "react";
import DonationButton from "./DonationButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t('navbar.home'), icon: Home },
    { href: "/deck-builder", label: t('navbar.deckBuilder'), icon: Library },
    { href: "/game", label: t('navbar.game'), icon: Gamepad2 },
    { href: "/tournament", label: t('navbar.tournament'), icon: Trophy },
    { href: "/life-counter", label: t('navbar.lifeCounter'), icon: Heart },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/pixelpox.webp"
              alt="MTG Premodern"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-bold text-white hidden sm:block">
              MTG Premodern
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive(item.href)
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Separador visual */}
            <div className="w-px h-6 bg-gray-700 mx-2" />
            
            {/* Selector de idioma */}
            <LanguageSelector />
            
            {/* Separador visual */}
            <div className="w-px h-6 bg-gray-700 mx-2" />
            
            {/* Botón de donaciones */}
            <DonationButton variant="navbar" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Separador visual */}
              <div className="w-full h-px bg-gray-700 my-2" />
              
              {/* Selector de idioma en móvil */}
              <div className="px-2" onClick={() => setIsMobileMenuOpen(false)}>
                <LanguageSelector />
              </div>
              
              {/* Separador visual */}
              <div className="w-full h-px bg-gray-700 my-2" />
              
              {/* Botón de donaciones en móvil */}
              <div className="px-2" onClick={() => setIsMobileMenuOpen(false)}>
                <DonationButton variant="navbar" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
