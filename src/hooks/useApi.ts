import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from 'react-query';
import { AxiosError } from 'axios';
import useToast from './useToast';

/**
 * Custom hook for API GET requests using react-query
 */
export function useApiQuery<TData, TError = AxiosError>(
  queryKey: string | string[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError, TData>
) {
  const toast = useToast();

  return useQuery<TData, TError, TData>(
    queryKey,
    queryFn,
    {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // Consider data fresh for 30 seconds by default
      cacheTime: 60000, // Keep data in cache for 1 minute by default
      onError: (error: any) => {
        // Show error toast
        toast.error(error?.response?.data?.message || 'خطا در دریافت اطلاعات');
        
        // Call the original onError if provided
        if (options?.onError) {
          options.onError(error);
        }
      },
      ...options,
    }
  );
}

/**
 * Custom hook for API mutations (POST, PUT, PATCH, DELETE) using react-query
 */
export function useApiMutation<TData, TVariables, TError = AxiosError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const toast = useToast();

  return useMutation<TData, TError, TVariables>(
    mutationFn,
    {
      onError: (error: any) => {
        // Show error toast
        toast.error(error?.response?.data?.message || 'خطا در انجام عملیات');
        
        // Call the original onError if provided
        if (options?.onError) {
          options.onError(error);
        }
      },
      ...options,
    }
  );
}