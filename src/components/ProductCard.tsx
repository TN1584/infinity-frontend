"use client";
import Link from "next/link";
import { formatPrice, formatSold, salePrice, discountPct } from "@/lib/data";
import { useWishlist } from "./WishlistContext";

export default function ProductCard({p}:{p:any}){
  const {toggle, has}=useWishlist();
  const wished=has(p.slug);
  const disc=discountPct(p);
  const price=salePrice(p);
  return (
    <Link href={`/products/${p.slug}`} className="group bg-white border border-neutral-100 hover:border-black hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="aspect-[1/1] bg-[#f5f5f5] relative overflow-hidden">
        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-500" loading="lazy" />
        {disc>0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-1 leading-none text-center">-{disc}%<br/><span className="font-normal line-through opacity-80"></span></span>}
        {p.isFlashSale && <span className="absolute top-2 left-2 bg-black text-white text-[9px] tracking-[0.12em] uppercase font-bold px-2 py-1">⚡ Flash</span>}
        <button
          onClick={(e)=>{e.preventDefault(); toggle(p.slug);}}
          aria-label="wishlist"
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition ${wished?"bg-black text-white opacity-100":"bg-white opacity-0 group-hover:opacity-100"}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished?"currentColor":"none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        {p.freeShipping && <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] tracking-wide uppercase font-bold px-2 py-1">Gratis Ongkir</span>}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        {(p.store?.badge==="mall") && <span className="w-fit text-[9px] font-bold bg-red-600 text-white px-1">Mall</span>}
        <h3 className="text-[12px] leading-[1.4] line-clamp-2 min-h-[34px] text-neutral-800 mt-1 group-hover:text-black">{p.title}</h3>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[14px] font-bold tracking-tight text-red-600">{formatPrice(price)}</span>
        </div>
        {p.price_max!==price && <span className="text-[10px] text-neutral-400 line-through">{formatPrice(p.price_max)}</span>}
        <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">
          <span className="text-black">★ {p.rating}</span>
          <span className="text-neutral-300">|</span>
          <span>Terjual {formatSold(p.sold)}</span>
          {p.condition==="Bekas" && <span className="ml-auto border border-neutral-300 px-1">Bekas</span>}
        </div>
        <div className="text-[10px] text-neutral-400 mt-0.5 truncate">{p.store?.city} • {p.store?.name}</div>
      </div>
    </Link>
  )
}
