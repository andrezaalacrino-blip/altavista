import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Tipografia única da marca. O manual pede Glancyr; até os arquivos (e a
 * licença web) chegarem, Urbanist é a geométrica mais próxima no Google Fonts.
 * Para trocar: next/font/local com os .woff2 em src/fonts e a mesma variável.
 */
const brand = Urbanist({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Alta Vista Coffee — O valor do seu café merece ir mais longe",
    template: "%s · Alta Vista Coffee",
  },
  description: site.description,
  keywords: ["intermediação de café", "café escolha", "conferência no armazém", "Santa Rita de Minas", "Alta Vista Coffee"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    title: "Alta Vista Coffee — O valor do seu café merece ir mais longe",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f1",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  description: site.description,
  telephone: `+${site.whatsapp.digits}`,
  ...((site.address.confirmed as boolean)
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: "BR",
        },
      }
    : {}),
};

/** Marca o documento antes do primeiro paint (motion só quando permitido). */
const motionFlag = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${brand.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
