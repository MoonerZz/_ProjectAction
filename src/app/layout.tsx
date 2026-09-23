import type { Metadata, Viewport } from "next";
import { brand } from "@/lib/brand";
import { Pwa } from "@/components/pwa";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  icons: { icon: "/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: brand.theme };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      style={
        {
          "--ink": brand.theme,
          "--accent": brand.accent,
          "--paper": brand.background,
        } as React.CSSProperties
      }
    >
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
        <Pwa />
      </body>
    </html>
  );
}
