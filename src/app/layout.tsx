import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "OneFlow | Social Planner",
  description: "Professional social media planner for OneFlow",
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen">
          <div className="p-5 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
