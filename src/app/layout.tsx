import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | UniCase",
    default: "UniCase | دنیای قاب و اکسسوری خاص",
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
        className={`${vazir.variable} font-sans antialiased bg-background text-foreground `}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
