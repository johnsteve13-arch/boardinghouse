import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/authContext';
import { CompareProvider } from '../lib/compareContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'SEAIT Stay — World-Class Boarding House Finder | Tupi, South Cotabato',
  description:
    'Find and compare verified boarding houses, dormitories, and bedspaces near South East Asian Institute of Technology (SEAIT), Crossing Rubber, Tupi, South Cotabato, Philippines.',
  keywords: [
    'SEAIT',
    'South East Asian Institute of Technology',
    'Tupi South Cotabato',
    'Crossing Rubber',
    'boarding house',
    'student dormitory',
    'student accommodation'
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <CompareProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
