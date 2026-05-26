"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(var(--surface))",
            color: "rgb(var(--ink))",
            border: "1px solid rgb(var(--line))",
            borderRadius: "16px",
          },
        }}
      />
    </NextThemeProvider>
  );
}
