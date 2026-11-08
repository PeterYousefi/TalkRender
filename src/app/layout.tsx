import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalkRender | Voice-Directed Autonomous Web Canvas',
  description:
    'Production-ready full-stack Voice-Directed Autonomous Web Canvas powered by Boson AI & LiveKit WebRTC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
