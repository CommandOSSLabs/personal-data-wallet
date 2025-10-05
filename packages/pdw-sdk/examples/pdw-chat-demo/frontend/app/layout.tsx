import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PDW Chat Demo',
  description: 'Minimal chat interface for the Personal Data Wallet SDK example.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
