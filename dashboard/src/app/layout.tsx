import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoPatch AI Agent',
  description: 'Autonomous vulnerability remediation and patch orchestration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-gray-100 flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-black p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
