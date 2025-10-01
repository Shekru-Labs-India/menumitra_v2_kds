import React from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// 30 seconds in milliseconds
const THIRTY_SECONDS =  30 * 1000;

// Create a singleton QueryClient with 30s defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: THIRTY_SECONDS,
      gcTime: THIRTY_SECONDS, 
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const CacheProvider = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export { queryClient };


