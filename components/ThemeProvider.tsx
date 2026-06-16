"use client";

import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // 1. LocalStorage yoki brauzer tizim sozlamasidan rejimni aniqlaymiz
    const savedTheme = localStorage.getItem("theme") || "system";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const activeTheme = savedTheme === "system" ? systemTheme : savedTheme;

    // 2. globals.css dagi dark variantingiz ishlashi uchun HTML sinfini yangilaymiz
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Gidratsiya miltillashini va server-side ziddiyatlarini 100% to'xtatish uchun guard
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return <>{children}</>;
}