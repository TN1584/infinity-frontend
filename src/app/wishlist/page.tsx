"use client";
import Link from "next/link";
import { useAllProducts } from "@/components/SellerContext";
import { useWishlist } from "@/components/WishlistContext";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage(){
  const {wishlist, remove, clear}=useWishlist();
  const products:any[]=useAllProducts();
  const list=products.filter((p:any)=>wishlist.includes(p.slug));
  if(list.length===0) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <div className="text-6xl grayscale">♡</div>
      <h1 className="text-[18px] font-bold tracking-wide uppercase mt-4">Wishlist Kosong</h1>
      <p className="text-[13px] text-neutral-500 mt-1">Simpan produk favoritmu dengan ikon ♥</p>
      <Link href="/products" className="inline-block mt-6 bg-black text-white px-8 py-3 text-[11px] tracking-[0.14em] uppercase font-bold">Cari Produk</Link>
    </div>
  );
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px] font-bold tracking-tight">Wishlist Saya ({list.length})</h1>
          <button onClick={clear} className="text-[11px] tracking-widest uppercase hover:text-red-600">Hapus Semua</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          {list.map((p:any)=>(
            <div key={p.id} className="relative">
              <ProductCard p={p} />
              <button onClick={()=>remove(p.slug)} className="absolute top-2 left-2 bg-white border border-neutral-200 text-[10px] px-2 py-1 tracking-wide uppercase font-bold hover:border-red-600 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
