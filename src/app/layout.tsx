import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartContext";
import AuthProvider from "@/components/AuthContext";
import WishlistProvider from "@/components/WishlistContext";
import CatalogProvider from "@/components/CatalogContext";
import SellerProvider from "@/components/SellerContext";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "INFINITY — Marketplace Semua Kebutuhan",
  description: "Marketplace umum ala Shopee/Blibli: elektronik, fashion, HP & gadget, kebutuhan tani, preloved & florist — harga transparan, gratis ongkir, flash sale tiap hari.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
          <WishlistProvider>
          <CatalogProvider>
          <SellerProvider>
            <Suspense fallback={<div className="h-[96px] border-b" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
          </SellerProvider>
          </CatalogProvider>
          </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
