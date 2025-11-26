import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio de Produção Audiovisual",
  description: "Plataforma completa para criação de conteúdo audiovisual profissional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
