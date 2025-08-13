import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onPress?: () => void;
  ms?: number;
  preventDefault?: boolean;
}

export const useLongPress = ({
  onLongPress,
  onPress,
  ms = 500,
  preventDefault = true,
}: UseLongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      isLongPress.current = false;
      
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, ms);
    },
    [onLongPress, ms, preventDefault]
  );

  const stop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Si no fue un long press y tenemos onPress, ejecutarlo
      if (!isLongPress.current && onPress) {
        onPress();
      }
    },
    [onPress]
  );

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};
