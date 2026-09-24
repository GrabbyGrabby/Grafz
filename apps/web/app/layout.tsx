import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: "Grafz | Memory API for the AI era",
  description: "The scalable Memory API for AI agents and humans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${poppins.variable} font-sans bg-bg text-main antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
