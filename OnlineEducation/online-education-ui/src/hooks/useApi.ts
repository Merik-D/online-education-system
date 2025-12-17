import { useState, useCallback } from 'react';

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

export interface UseApiReturn<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  setError: (error: ApiError | null) => void;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useApi = <T = unknown>(): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  return {
    data,
    error,
    loading,
    setError: useCallback((error: ApiError | null) => setError(error), []),
    setData: useCallback((data: T | null) => setData(data), []),
    setLoading: useCallback((loading: boolean) => setLoading(loading), []),
  };
};

export const formatApiError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message;
  }

  return 'An unexpected error occurred';
};
