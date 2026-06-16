'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient ni har bir so'rov uchun qayta yaratmaslik uchun useState dan foydalanamiz
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools yordamida keshda nima borligini ko'rib turamiz */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}