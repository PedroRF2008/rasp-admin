"use client";

import { Spinner } from "@nextui-org/react";

export function LoadingContent({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <Spinner size="lg" />
      <p className="text-default-500">{message}</p>
    </div>
  );
}

export function LoadingPage({ message = "Carregando..." }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-default-500">{message}</p>
      </div>
    </div>
  );
} 