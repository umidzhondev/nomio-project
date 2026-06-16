"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}