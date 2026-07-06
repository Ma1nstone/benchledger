import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "BenchLedger — Parts, Builds & Sales",
  description: "Track PC parts inventory, assemble builds, and manage sales.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Explicit tags as a fallback in case metadata.icons doesn't take
            effect after a cached deploy — these always force the icon.
            favicon.ico is included because browsers request /favicon.ico
            automatically regardless of these tags; without a real file
            there, that request 404s even if the SVG icon itself is fine. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
