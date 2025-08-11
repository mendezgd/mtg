import { useEffect, useRef, useCallback } from "react";
import { logger } from "@/lib/logger";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

interface UsePerformanceOptions {
  componentName: string;
  enabled?: boolean;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export const usePerformance = ({
  componentName,
  enabled = process.env.NODE_ENV === "development",
  onMetrics,
}: UsePerformanceOptions) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  }, [enabled]);

  const endRender = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    const timestamp = Date.now();

    const metrics: PerformanceMetrics = {
      renderTime,
      timestamp,
    };

    // Get memory usage if available
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize;
    }

    logger.debug(`${componentName} render #${renderCount.current}:`, {
      renderTime: `${renderTime.toFixed(2)}ms`,
      memoryUsage: metrics.memoryUsage
        ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
        : "N/A",
    });

    onMetrics?.(metrics);
    renderStartTime.current = 0;
  }, [enabled, componentName, onMetrics]);

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return {
    startRender,
    endRender,
    renderCount: renderCount.current,
  };
};

// Hook for measuring specific operations
export const useOperationTimer = (operationName: string) => {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = performance.now();
    logger.debug(`Starting operation: ${operationName}`);
  }, [operationName]);

  const end = useCallback(() => {
    if (startTime.current === 0) return;

    const duration = performance.now() - startTime.current;
    logger.debug(
      `Operation ${operationName} completed:`,
      `${duration.toFixed(2)}ms`
    );
    startTime.current = 0;

    return duration;
  }, [operationName]);

  return { start, end };
};
