import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/Layouts/SiteShell";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { getSocialLinks } from "@/lib/publicApi";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
  };
}

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
      <body className={`${outfit.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SiteShell socialLinks={socialLinks}>
            {children}
          </SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
