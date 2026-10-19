import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blink | All-In-One Multi-Chain EVM Sniper Suite',
  description: 'High-performance fleet minting, OpenSea drops, copy-mints, and auto-sweep on Base, Ethereum, Ink, Arc, and Arbitrum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#07090E] text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
