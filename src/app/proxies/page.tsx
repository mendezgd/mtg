"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  PROXY_PROMOTIONS,
  PROXY_EXAMPLE_IMAGES,
} from "@/lib/proxy-promotions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Instagram, Twitter, Twitch } from "lucide-react";

const PROXIES_SOCIAL_LINKS = [
  { href: "https://www.instagram.com/proxypoxtcg/", label: "Instagram", icon: Instagram, className: "bg-[#E4405F] hover:bg-[#c13584]" },
  { href: "https://x.com/poxshow", label: "X", icon: Twitter, className: "bg-black hover:bg-gray-800 text-white" },
  { href: "https://www.twitch.tv/fattiepox", label: "Twitch", icon: Twitch, className: "bg-[#9146FF] hover:bg-[#772ce8]" },
  { href: "https://kick.com/fattiepox", label: "Kick", icon: null, className: "bg-[#53FC18] hover:bg-[#45d914] text-black", kickLetter: "K" },
] as const;

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProxiesPage() {
  const { t } = useLanguage();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-amber-400">
            {t("proxies.title")}
          </h1>
          <p className="text-lg text-gray-300">{t("proxies.subtitle")}</p>
        </div>
      </section>

      {/* Carousel de ejemplos */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-200">
            {t("proxies.examplesTitle")}
          </h2>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {PROXY_EXAMPLE_IMAGES.map((src, index) => (
                <CarouselItem
                  key={`${src}-${index}`}
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-[70%] md:basis-[45%] lg:basis-[35%]"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxSrc(src)}
                    className="relative aspect-[3/4] max-h-[320px] w-full rounded-lg overflow-hidden border border-gray-700 bg-gray-900 shadow-xl transition-transform duration-200 ease-out hover:scale-110 origin-center block cursor-pointer text-left"
                  >
                    <Image
                      src={src}
                      alt={`Ejemplo de proxy ${index + 1}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 85vw, (max-width: 768px) 70vw, (max-width: 1024px) 45vw, 35vw"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <Dialog open={!!lightboxSrc} onOpenChange={(open) => !open && setLightboxSrc(null)}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 bg-transparent shadow-none overflow-visible text-white [&>button]:text-white [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-white/20 [&>button]:rounded-full">
              <DialogTitle className="sr-only">Vista ampliada de imagen</DialogTitle>
              {lightboxSrc && (
                <div className="relative w-[90vw] h-[90vh] max-w-4xl max-h-[85vh] mx-auto">
                  <Image
                    src={lightboxSrc}
                    alt="Vista ampliada"
                    fill
                    className="object-contain"
                    sizes="95vw"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
          {/* Redes sociales */}
          <div className="mt-10 text-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              {t("proxies.socialTitle")}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {PROXIES_SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg ${item.className}`}
                  aria-label={item.label}
                >
                  {item.icon ? (
                    <item.icon className="w-4 h-4 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.kickLetter}
                    </span>
                  )}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promociones */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROXY_PROMOTIONS.map((promo) => {
              const title = t(`proxies.promotions.${promo.id}.title`);
              return (
                <Card
                  key={promo.id}
                  className="bg-gray-900/80 border-gray-700 hover:border-amber-500/50 transition-colors overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Package className="w-5 h-5 text-amber-400" />
                        </div>
                        <CardTitle className="text-lg text-white">
                          {title}
                        </CardTitle>
                      </div>
                      {promo.freeShipping && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shrink-0"
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          {t("proxies.freeShipping")}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400">
                      {promo.cardsCount} {t("proxies.cardsCount")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-2xl font-bold text-amber-400">
                      ${formatPrice(promo.price)}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 text-sm text-gray-500">
                    {promo.custom && (
                      <span className="text-amber-400/90">
                        {t("proxies.customHint")}
                      </span>
                    )}
                    {promo.cube && (
                      <span className="text-amber-400/90">
                        {t("proxies.cubeHint")}
                      </span>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {/* Cómo pedir: por DM en Instagram */}
          <div className="mt-12 p-6 rounded-xl bg-gray-900/60 border border-gray-700 text-center max-w-2xl mx-auto">
            <p className="text-gray-200 mb-2">
              {t("proxies.orderByDm")}
            </p>
            <p className="text-amber-400/90 text-sm mb-4">
              {t("proxies.orderArgentinaOnly")}
            </p>
            <a
              href="https://www.instagram.com/proxypoxtcg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#E4405F] hover:bg-[#c13584] text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              aria-label={t("proxies.orderCta")}
            >
              <Instagram className="w-4 h-4" />
              {t("proxies.orderCta")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
