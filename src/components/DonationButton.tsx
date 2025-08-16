'use client';

import { useState, useEffect } from 'react';
import { Heart, Coffee, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DonationButtonProps {
  variant?: 'floating' | 'navbar';
  className?: string;
}

export default function DonationButton({ 
  variant = 'floating', 
  className = '' 
}: DonationButtonProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Efecto de pulso discreto cada 15 segundos (solo para floating)
  useEffect(() => {
    if (variant === 'floating') {
      const pulseInterval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 1000);
      }, 15000);

      return () => clearInterval(pulseInterval);
    }
  }, [variant]);

  const handleDonationClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Versión para navbar - más compacta
  if (variant === 'navbar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
            aria-label="Opciones de donación"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden lg:inline">Apoyar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
            Apoya mi trabajo
          </div>
          
          <DropdownMenuItem
            onClick={() => handleDonationClick('https://ko-fi.com/fattiepox')}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-[#29abe2] rounded-full flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Invítame un café
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ko-fi
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleDonationClick('https://www.mercadopago.com.ar/fattiepox')}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-[#009ee3] rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Donar con MercadoPago
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                MercadoPago
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Versión flotante original (mantenida para compatibilidad)
  return (
    <>
      {/* Botón flotante principal */}
      <button
        onClick={() => setIsPulsing(true)}
        className={`
          fixed bottom-5 right-5 z-50
          w-12 h-12 md:w-[50px] md:h-[50px]
          bg-[#29abe2] hover:bg-[#009ee3]
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          hover:scale-105 active:scale-95
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-[#29abe2] focus:ring-opacity-50
          donation-button donation-button-mobile
          ${isPulsing ? 'donation-pulse' : ''}
          ${className}
        `}
        aria-label="Abrir opciones de donación"
      >
        <Heart className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
