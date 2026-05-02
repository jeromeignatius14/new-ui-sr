// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AddToHomeScreenPrompt from "./components/AddToHomeScreenPrompt";
import NotificationsInit from './components/NotificationsInit';
import ServiceWorkerUpdater from "./components/ServiceWorkerUpdater";
import packageJson from "../package.json";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rolling Block Management System",
  description: "App designed & developed by Southern Railway",
  themeColor: "#000000", // required for PWA
  manifest: "/manifest.json", // <-- Important for App Router
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Catches PWA installs that don't have ServiceWorkerUpdater yet */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', function() {
              window.location.reload();
            });
          }
          // Auto-reload on Next.js chunk load errors (stale PWA cache after deploy)
          function _isChunkError(msg) {
            return msg && (
              msg.indexOf('ChunkLoadError') !== -1 ||
              msg.indexOf('Loading chunk') !== -1 ||
              msg.indexOf('Failed to fetch') !== -1 ||
              msg.indexOf('Importing a module script failed') !== -1 ||
              msg.indexOf('dynamically imported module') !== -1
            );
          }
          window.addEventListener('error', function(e) {
            if (_isChunkError(e.message)) { window.location.reload(); }
          });
          window.addEventListener('unhandledrejection', function(e) {
            var msg = e.reason && (e.reason.message || String(e.reason));
            if (_isChunkError(msg)) { window.location.reload(); }
          });
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <small style={{"zIndex":9999,"backgroundColor":"#0000008f",position:"fixed",bottom:0,left:0}}>
          Version:{packageJson.version}
        </small>
        <Providers>
          <ServiceWorkerUpdater />
          <AddToHomeScreenPrompt />
          <NotificationsInit />
          {children}
        </Providers>
   
       
      </body>
    </html>
  );
}
