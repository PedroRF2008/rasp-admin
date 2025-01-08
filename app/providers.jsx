'use client';

import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from '@/contexts/auth';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <NextUIProvider>
      <NextThemesProvider 
        attribute="class" 
        defaultTheme="dark"
        themes={['light', 'dark']}
        enableSystem={false}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-content1 text-foreground',
          }}
        />
      </NextThemesProvider>
    </NextUIProvider>
  );
}