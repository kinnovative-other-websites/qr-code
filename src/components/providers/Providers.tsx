"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { LinksProvider } from "./LinksProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <LinksProvider>{children}</LinksProvider>
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
