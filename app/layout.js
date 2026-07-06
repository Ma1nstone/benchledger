import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "BenchLedger — Parts, Builds & Sales",
  description: "Track PC parts inventory, assemble builds, and manage sales.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/favicon.svg?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* The ?v=2 on these two lines is a cache-buster: browsers cache a
            favicon by its exact URL, so simply re-deploying the same file
            path isn't always enough to make a visited browser tab notice
            the change. Bump this number (v=3, v=4, ...) any time you swap
            the favicon file again in the future and it isn't picking up. */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        <main className="mx-auto max-w-[1600px] px-6 py-8 sm:px-10">{children}</main>
      </body>
    </html>
  );
}
