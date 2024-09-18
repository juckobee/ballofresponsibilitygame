import './globals.css'
import { Bangers } from 'next/font/google';

const bangers = Bangers({ 
  subsets: ['latin'], 
  weight: '400',
  variable: '--font-bangers', // Add this line
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bangers.variable}`}>
      <body>{children}</body>
    </html>
  );
}
