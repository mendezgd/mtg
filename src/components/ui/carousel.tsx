"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedScrollSnap: () => number;
  scrollSnapList: () => unknown[];
};

interface CarouselContextValue {
  api: CarouselApi | undefined;
  setApi: (api: CarouselApi) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  setScrollState: (prev: boolean, next: boolean) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: {
    align?: "start" | "center" | "end";
    loop?: boolean;
  };
  setApi?: (api: CarouselApi) => void;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ setApi, opts, className, children, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [apiState, setApiState] = React.useState<CarouselApi | undefined>();
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(true);

    const updateApi = React.useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const prev = el.scrollLeft > 2;
      const next =
        el.scrollLeft < el.scrollWidth - el.offsetWidth - 2;
      setCanScrollPrev(prev);
      setCanScrollNext(next);

      const scrollPrev = () => {
        el.scrollBy({ left: -el.offsetWidth, behavior: "smooth" });
      };
      const scrollNext = () => {
        el.scrollBy({ left: el.offsetWidth, behavior: "smooth" });
      };
      const selectedScrollSnap = () =>
        Math.round(el.scrollLeft / el.offsetWidth) || 0;
      const scrollSnapList = () =>
        Array.from({ length: el.children.length }, (_, i) => i);

      const api: CarouselApi = {
        scrollPrev,
        scrollNext,
        canScrollPrev: prev,
        canScrollNext: next,
        selectedScrollSnap,
        scrollSnapList,
      };
      setApiState(api);
      setApi?.(api);
    }, [setApi]);

    React.useEffect(() => {
      updateApi();
      const el = scrollRef.current;
      if (!el) return;
      const onScroll = () => updateApi();
      el.addEventListener("scroll", onScroll);
      const ro = new ResizeObserver(updateApi);
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", onScroll);
        ro.disconnect();
      };
    }, [updateApi]);

    const value: CarouselContextValue = {
      api: apiState,
      setApi: (api) => {
        setApiState(api);
        setApi?.(api);
      },
      scrollRef,
      setScrollState: (prev, next) => {
        setCanScrollPrev(prev);
        setCanScrollNext(next);
      },
      canScrollPrev,
      canScrollNext,
    };

    return (
      <CarouselContext.Provider value={value}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }
>(({ className, ...props }, ref) => {
  const { scrollRef } = useCarousel();
  return (
    <div ref={ref} className="overflow-hidden">
      <div
        ref={(node) => {
          (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-roledescription="carousel"
        className={cn(
          "flex overflow-x-auto overflow-y-hidden gap-4 snap-x snap-mandatory scroll-smooth scrollbar-hide",
          "[-ms-overflow-style:none] [scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 shrink-0 snap-center", className)}
    {...props}
  />
));
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { api, canScrollPrev } = useCarousel();
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-600 bg-gray-900/90 hover:bg-gray-800 text-white z-10",
        className
      )}
      disabled={!canScrollPrev}
      onClick={() => api?.scrollPrev()}
      {...props}
    >
      <ChevronLeft className="h-5 w-5" />
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { api, canScrollNext } = useCarousel();
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-gray-600 bg-gray-900/90 hover:bg-gray-800 text-white z-10",
        className
      )}
      disabled={!canScrollNext}
      onClick={() => api?.scrollNext()}
      {...props}
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export type { CarouselApi };
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
};
