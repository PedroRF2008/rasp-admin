import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Raspberry Kiosk Admin",
  description: "Admin panel for Raspberry Kiosk",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
