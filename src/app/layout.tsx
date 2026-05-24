import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const mont = Montserrat({
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Res-Q",
  description: "Real-time emergency communication for residential buildings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={mont.className}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        </body>
    </html>
  );
}
