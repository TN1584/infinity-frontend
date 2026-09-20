"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { flashSaleEndsAt } from "@/lib/data";
import { useAllProducts } from "@/components/SellerContext";
import ProductCard from "@/components/ProductCard";

export default function FlashSalePage(){
  const products:any[]=useAllProducts();
  const [left,setLeft]=useState(0);
  useEffect(()=>{
    const tick=()=>setLeft(Math.max(0, flashSaleEndsAt()-Date.now()));
    tick();
    const t=setInterval(tick,1000);
    return ()=>clearInterval(t);
  },[]);
  const h=Math.floor(left/3600000), m=Math.floor(left%3600000/60000), s=Math.floor(left%60000/1000);
  const pad=(n:number)=>String(n).padStart(2,"0");
  const flash=products.filter((p:any)=>p.isFlashSale);
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="bg-red-600 text-white p-6 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase font-bold opacity-80">Berakhir dalam</div>
            <h1 className="text-[26px] font-black tracking-tight">⚡ FLASH SALE</h1>
          </div>
          <div className="flex gap-1.5 text-[16px] font-bold ml-auto">
            {[pad(h),pad(m),pad(s)].map((u,i)=>(
              <span key={i} className="bg-black/40 px-2.5 py-1.5">{u}</span>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white border border-neutral-200 p-5">
          <div className="text-[12px] text-neutral-500">Gunakan voucher <b className="text-black">FLASH20</b> untuk ekstra 20% di produk ini.</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {flash.map((p:any)=> <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/products" className="inline-block border border-black bg-white px-8 py-2.5 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-black hover:text-white transition">Lihat Semua Produk</Link>
        </div>
      </div>
    </div>
  )
}
