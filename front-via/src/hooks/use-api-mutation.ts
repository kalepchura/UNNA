import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { extraerMensajeError } from '@/lib/http';

interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'onSuccess' | 'onError'> {
  mensajeExito?: string;
  mostrarToastError?: boolean;
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onError?: (error: Error, variables: TVariables, context: unknown) => void;
}

export function useApiMutation<TData, TVariables>(
  options: UseApiMutationOptions<TData, TVariables>,
): UseMutationResult<TData, Error, TVariables> {
  const { mensajeExito, mostrarToastError = true, onSuccess, onError, ...rest } = options;

  return useMutation<TData, Error, TVariables>({
    ...rest,
    onSuccess: (data, variables, context) => {
      if (mensajeExito) toast.success(mensajeExito);
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (mostrarToastError) {
        toast.error(extraerMensajeError(error));
      }
      onError?.(error, variables, context);
    },
  });
}