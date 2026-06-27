import { useEffect, useCallback } from 'react';
import { onSocketEvent, offSocketEvent, emitSocketEvent } from '../services/socketService';

export function useSocketEvent(event, handler) {
  const callback = useCallback(
    (payload) => {
      if (handler) handler(payload);
    },
    [handler],
  );

  useEffect(() => {
    if (!handler) return undefined;

    onSocketEvent(event, callback);
    return () => {
      offSocketEvent(event, callback);
    };
  }, [event, callback, handler]);
}

export function useSocketEmit() {
  return emitSocketEvent;
}
