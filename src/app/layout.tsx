import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DocenteHub - Gestión de Cursos para Docentes",
  description:
    "Plataforma SaaS para la planificación, gestión y análisis económico de cursos impartidos por docentes y formadores freelance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Toaster position="top-right" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
