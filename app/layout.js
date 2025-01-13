import "./globals.css";
import { Providers } from "./providers";

const RootLayout = ({ children }) => {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>DGT Kiosk - Sistema de Gerenciamento</title>
        <meta name="description" content="Sistema de gerenciamento de quiosques digitais para exibição de conteúdo em tempo real." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
