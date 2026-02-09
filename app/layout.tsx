import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic"] });

export const metadata = {
  title: "Mardo Chat",
  description: "سیستەمی چاتی ماردۆ",
  icons: {
    icon: "/favicon.ico", // ئەڤە ئایکۆنێ تە یێ نوویە
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ku" dir="rtl">
      <body className={`${vazir.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        {children}
      </body>
    </html>
  );
}