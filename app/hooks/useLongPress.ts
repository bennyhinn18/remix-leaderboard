import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  onRightClick?: () => void;
  threshold?: number; // milliseconds for long press
}

export function useLongPress({ 
  onLongPress, 
  onClick, 
  onRightClick,
  threshold = 500 
}: UseLongPressOptions) {
  const isLongPress = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    // Clear any existing timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    isLongPress.current = false;
    
    // Store starting position to detect movement
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    startPosition.current = { x: clientX, y: clientY };

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const clear = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    startPosition.current = null;
  }, []);

  const end = useCallback(() => {
    clear();
    
    if (!isLongPress.current && onClick) {
      onClick();
    }
    
    isLongPress.current = false;
  }, [clear, onClick]);

  const move = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!startPosition.current) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    // If user moves too much, cancel long press
    const distance = Math.sqrt(
      Math.pow(clientX - startPosition.current.x, 2) + 
      Math.pow(clientY - startPosition.current.y, 2)
    );
    
    if (distance > 10) { // 10px threshold
      clear();
    }
  }, [clear]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (onRightClick) {
      onRightClick();
    }
  }, [onRightClick]);

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: clear,
    onMouseMove: move,
    onTouchStart: start,
    onTouchEnd: end,
    onTouchCancel: clear,
    onTouchMove: move,
    onContextMenu: handleContextMenu,
  };
}