import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'T5C - The 5th Continent',
  description: 'Multiplayer 3D top down RPG',
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