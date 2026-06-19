import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Rankings',
  description: 'One curator\'s movie rankings, plus what everyone else thinks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-surface2 py-8 mt-16">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs font-mono-num text-muted">
            <span>&copy; {new Date().getFullYear()} The Rankings</span>
            <Link href="/admin" className="hover:text-amber transition-colors">
              Curator sign in
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
