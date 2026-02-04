import "./globals.css";
import Link from "next/link";
import { DevSessionWidget } from "../components/DevSessionWidget";

export const metadata = {
  title: "Raffle Marketplace MVP",
  description: "Raffle / High-ticket Marketplace MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-800 bg-slate-950">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">Raffle / High-ticket Marketplace</h1>
                  <p className="text-sm text-slate-400">MVP demo flows</p>
                </div>
                <nav className="flex gap-4 text-sm text-slate-300">
                  <Link href="/listings" className="hover:text-white">
                    Listings
                  </Link>
                  <Link href="/seller/listings" className="hover:text-white">
                    Seller
                  </Link>
                </nav>
              </div>
              <DevSessionWidget />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
