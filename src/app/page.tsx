"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { banners, vouchers, flashSaleEndsAt, formatPrice } from "@/lib/data";
import { useCatalog } from "@/components/CatalogContext";
import { useAllProducts } from "@/components/SellerContext";
import ProductCard from "@/components/ProductCard";

function useCountdown(){
  const [left,setLeft]=useState(0);
  useEffect(()=>{
    const tick=()=>setLeft(Math.max(0, flashSaleEndsAt()-Date.now()));
    tick();
    const t=setInterval(tick,1000);
    return ()=>clearInterval(t);
  },[]);
  const h=Math.floor(left/3600000), m=Math.floor(left%3600000/60000), s=Math.floor(left%60000/1000);
  const pad=(n:number)=>String(n).padStart(2,"0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function Home(){
  const [slide,setSlide]=useState(0);
  const products:any[]=useAllProducts();
  const {categories, stores, rfqs, loading, error, refresh}=useCatalog();
  const countdown=useCountdown();
  useEffect(()=>{
    const t=setInterval(()=>setSlide(s=>(s+1)%banners.length),5000);
    return ()=>clearInterval(t);
  },[]);
  const flash=products.filter((p:any)=>p.isFlashSale);
  const recom=[...products].sort((a:any,b:any)=>b.sold-a.sold);
  const [tab,setTab]=useState("rekom");
  const tabDefs:[string,string][]=[["rekom","Rekomendasi"], ...categories.slice(0,7).map((c:any):[string,string]=>[(c.slug as string), (c.name as string)])];
  const tabList = tab==="rekom" ? recom : products.filter((p:any)=>p.category===tab);
  const b=banners[slide];

  return (
    <div className="bg-[#f5f5f5]">
      {error && (
        <div className="max-w-[1280px] mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-300 text-red-700 text-[12px] p-4 flex gap-3 items-center justify-between">
            <span>Tidak bisa memuat data dari database: {error}</span>
            <button onClick={refresh} className="border border-red-600 px-3 py-1 font-bold shrink-0">Coba Lagi</button>
          </div>
        </div>
      )}
      {loading && products.length===0 && !error && (
        <div className="max-w-[1280px] mx-auto px-4 pt-4">
          <div className="bg-white border border-neutral-200 p-10 text-center text-[11px] tracking-[0.16em] uppercase text-neutral-500">Memuat data dari database...</div>
        </div>
      )}
      {/* HERO carousel */}
      <div className="max-w-[1280px] mx-auto px-4 pt-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-8 relative bg-black overflow-hidden min-h-[280px] lg:min-h-[340px] flex">
            <img key={b.id} src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className={`relative m-4 lg:m-8 max-w-[60%] p-6 lg:p-8 flex flex-col justify-center ${b.theme==="dark"?"bg-black/80 text-white":"bg-white/95 text-black"}`}>
              <div className="text-[11px] tracking-[0.2em] uppercase font-bold opacity-60">Infinity Mall</div>
              <h1 className="text-[28px] lg:text-[38px] font-black leading-[0.95] tracking-tight mt-2">{b.title}<br/><span className="font-light italic text-[20px] lg:text-[26px]">{b.subtitle}</span></h1>
              <Link href={b.href} className={`mt-5 w-fit px-6 py-3 text-[11px] tracking-[0.16em] uppercase font-bold ${b.theme==="dark"?"bg-white text-black":"bg-black text-white"}`}>{b.cta}</Link>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((x,i)=>(
                <button key={x.id} onClick={()=>setSlide(i)} aria-label={`slide ${i+1}`} className={`h-1.5 rounded-full transition-all ${i===slide?"w-6 bg-white":"w-1.5 bg-white/50"}`} />
              ))}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Link href="/flash-sale" className="bg-red-600 text-white p-5 flex flex-col justify-center min-h-[120px]">
              <div className="text-[11px] tracking-[0.18em] uppercase font-bold opacity-80">⚡ Flash Sale • Berakhir {countdown}</div>
              <div className="text-[20px] font-black mt-1">Diskon s/d 90%</div>
              <span className="mt-2 w-fit bg-white text-red-600 text-[11px] font-bold px-3 py-1.5 tracking-widest uppercase">Serbu →</span>
            </Link>
            <div className="bg-white border border-neutral-200 p-5">
              <div className="text-[11px] tracking-[0.16em] uppercase font-bold">Voucher Hari Ini</div>
              <div className="mt-3 space-y-2">
                {vouchers.slice(0,2).map(v=>(
                  <div key={v.code} className="flex items-center gap-2 border border-dashed border-neutral-300 p-2">
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-1">{v.code}</span>
                    <span className="text-[11px] flex-1 truncate">{v.name}</span>
                    <Link href="/cart" className="text-[10px] font-bold underline underline-offset-2">Klaim</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* service strip */}
        <div className="mt-4 bg-white border border-neutral-200 grid grid-cols-2 md:grid-cols-4 text-center text-[11px] tracking-wide uppercase font-bold">
          {[["Gratis Ongkir"],["Bisa COD"],["100% Ori"],["30 Hari Retur"]].map(([t])=>(
            <div key={t} className="py-3 border-r last:border-0 border-neutral-100">{t}</div>
          ))}
        </div>
      </div>

      {/* KATEGORI */}
      <div className="max-w-[1280px] mx-auto px-4 mt-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-[13px] tracking-[0.16em] uppercase font-bold">Kategori</h2>
            <Link href="/products" className="text-[11px] underline underline-offset-4">Lihat Semua</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mt-4">
            {categories.map(c=>(
              <Link key={c.slug} href={`/products?category=${c.slug}`} className="text-[12px] tracking-wide uppercase text-neutral-700 hover:text-black hover:font-bold hover:underline hover:underline-offset-4 transition">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FLASH SALE */}
      <div className="max-w-[1280px] mx-auto px-4 mt-4">
        <div className="bg-white border border-neutral-200">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">
            <span className="text-[15px] font-black tracking-tight">⚡ FLASH SALE</span>
            <span className="flex gap-1 text-[12px] font-bold">
              {countdown.split(":").map((u,i)=>(
                <span key={i} className="bg-black text-white px-1.5 py-0.5">{u}</span>
              ))}
            </span>
            <Link href="/flash-sale" className="ml-auto text-[11px] tracking-widest uppercase font-bold hover:underline">Lihat Semua →</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar p-5">
            {flash.map((p:any)=>(
              <div key={p.id} className="min-w-[150px] max-w-[150px]"><ProductCard p={p} /></div>
            ))}
          </div>
        </div>
      </div>

      {/* MALL / TOKO */}
      <div className="max-w-[1280px] mx-auto px-4 mt-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-[13px] tracking-[0.16em] uppercase font-bold">Toko Pilihan</h2>
            <Link href="/suppliers" className="text-[11px] underline underline-offset-4">Semua Toko</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {stores.slice(0,5).map((s:any)=>(
              <Link key={s.slug} href={`/stores/${s.slug}`} className="border border-neutral-200 hover:border-black transition p-3 text-center">
                <img src={s.logo} className="w-12 h-12 rounded-full mx-auto object-cover" alt={s.name}/>
                <div className="text-[11px] font-bold uppercase truncate mt-2">{s.name}</div>
                <div className="text-[10px] text-neutral-500">★ {s.rating} • {s.city}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* REKOMENDASI */}
      <div className="max-w-[1280px] mx-auto px-4 mt-4">
        <div className="bg-white border border-neutral-200">
          <div className="px-5 pt-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200">
            {tabDefs.map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)} className={`whitespace-nowrap px-4 py-2.5 text-[11px] tracking-[0.12em] uppercase font-bold border-b-2 -mb-px ${tab===v?"border-black text-black":"border-transparent text-neutral-500 hover:text-black"}`}>{l}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5">
            {tabList.slice(0,18).map((p:any)=> <ProductCard key={p.id} p={p} />)}
          </div>
          <div className="text-center pb-6">
            <Link href="/products" className="inline-block border border-black px-8 py-2.5 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-black hover:text-white transition">Lihat Semua Produk</Link>
          </div>
        </div>
      </div>

      {/* RFQ + seller CTA */}
      <div className="max-w-[1280px] mx-auto px-4 mt-4 pb-10 grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-5 md:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] tracking-[0.16em] uppercase font-bold">RFQ Terbaru — Butuh Grosir?</h3>
            <Link href="/rfq" className="text-[11px] underline underline-offset-4">Semua</Link>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {rfqs.slice(0,4).map(r=>(
              <div key={r.id} className="border border-neutral-200 p-3">
                <div className="text-[12px] font-medium leading-snug line-clamp-2">{r.title}</div>
                <div className="text-[11px] text-neutral-500 mt-1">{r.qty} {r.unit} • {r.budget}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-black text-white p-6 flex flex-col">
          <div className="text-[11px] tracking-[0.2em] uppercase font-bold opacity-60">Untuk Seller & Petani</div>
          <div className="text-[20px] font-bold leading-tight mt-2">Jualan di INFINITY?</div>
          <p className="text-[13px] opacity-70 mt-2">Gratis ongkir, flash sale & voucher — jangkau jutaan pembeli.</p>
          <Link href="/seller/register" className="mt-5 bg-white text-black text-center py-3 text-[11px] tracking-[0.14em] uppercase font-bold">Daftar Jadi Seller</Link>
        </div>
      </div>
    </div>
  )
}
