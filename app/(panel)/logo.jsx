"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Logo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During server-side rendering and initial client render, always show light theme
  if (!mounted) {
    return (
      <div className="relative h-8 w-24 mr-2">
        <Image
          src="/logos/panel-light.png"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }
  
  return (
    <div className="relative h-8 w-24 mr-2">
      <Image
        src={theme === "dark" ? "/logos/panel-dark.png" : "/logos/panel-light.png"}
        alt="Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
} 