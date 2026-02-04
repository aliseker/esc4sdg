import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Layouts/Navbar";
import Footer from "@/components/Layouts/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getSocialLinks } from "@/lib/publicApi";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Escape4SDG – Ekip Ruhu ve Sürdürülebilir Kalkınma Hedefleri",
  description: "Escape room tarzı etkinlikler, MOOC'lar ve sertifikalarla SDG'leri keşfedin.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  let socialLinks: Awaited<ReturnType<typeof getSocialLinks>> = [];
  try {
    socialLinks = await getSocialLinks();
  } catch {
    // API erişilemezse boş liste; site yine de açılır
  }

  return (
    <html lang={locale}>
      <body className={`${outfit.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer socialLinks={socialLinks} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
