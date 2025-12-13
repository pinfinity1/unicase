import type { Metadata } from "next";
import { Lalezar } from "next/font/google";
import "./globals.css";

const lalezar = Lalezar({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-lalezar",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Casebar",
    default: "Casebar | دنیای قاب و اکسسوری خاص",
  },
  description: "مرجع تخصصی خرید جدیدترین قاب‌های گوشی و گجت‌های ترند",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${lalezar.className} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
