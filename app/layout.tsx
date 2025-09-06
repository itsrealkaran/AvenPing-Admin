import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvenPing Admin",
  description: "AvenPing Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
