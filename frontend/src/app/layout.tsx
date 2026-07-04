import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PeerPort | Decentralized P2P Marketplace',
  description: 'Trade digital assets securely using Rust-based Soroban smart contracts on the Stellar network.',
  openGraph: {
    title: 'PeerPort | Decentralized P2P Marketplace',
    description: 'Secure, peer-to-peer decentralized trading escrow marketplace on Stellar.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-black text-white`}>
        <Providers>
          <Navbar />
          <main className="flex-1 w-full relative z-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
