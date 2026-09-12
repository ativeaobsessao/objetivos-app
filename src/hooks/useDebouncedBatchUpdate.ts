import { useRef, useCallback } from 'react';

/**
 * Hook utilitário para agrupar e dar debounce em requisições de atualização em lote,
 * permitindo integração simplificada com eventos como onDragEnd.
 * @param delay Tempo de debounce em milissegundos (padrão: 500ms)
 */
export function useDebouncedBatchUpdate(delay: number = 500) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (
      updateFn: () => Promise<void>,
      onSuccess?: () => void,
      onError?: (err: any) => void
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          await updateFn();
          if (onSuccess) onSuccess();
        } catch (error) {
          if (onError) onError(error);
        }
      }, delay);
    },
    [delay]
  );

  return debouncedExecute;
}
