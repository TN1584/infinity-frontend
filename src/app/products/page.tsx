"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { useAllProducts } from "@/components/SellerContext";
import { useCatalog } from "@/components/CatalogContext";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

function ProductsContent(){
  const searchParams=useSearchParams();
  const router=useRouter();
  const cat=searchParams.get("category")||"all";
  const search=searchParams.get("search")||"";
  const [sort,setSort]=useState("recom");
  const [readyOnly,setReadyOnly]=useState(false);
  const [verifiedOnly,setVerifiedOnly]=useState(false);
  const [codOnly,setCodOnly]=useState(false);
  const [freeShipOnly,setFreeShipOnly]=useState(false);
  const [flashOnly,setFlashOnly]=useState(false);
  const [bekasOnly,setBekasOnly]=useState(false);
  const products:any[]=useAllProducts();
  const {categories, loading}=useCatalog();

  const display=useMemo(()=>{
    let list=[...products] as any[];
    if(cat!=="all") list=list.filter(p=> p.category===cat);
    if(search) {
      const s=search.toLowerCase();
      list=list.filter(p=> p.title.toLowerCase().includes(s) || p.store.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if(readyOnly) list=list.filter(p=>p.is_ready);
    if(verifiedOnly) list=list.filter(p=>["gold","mall","verified"].includes(String(p.store.badge).toLowerCase()));
    if(freeShipOnly) list=list.filter(p=>p.freeShipping);
    if(flashOnly) list=list.filter(p=>p.isFlashSale);
    if(bekasOnly) list=list.filter(p=>p.condition==="Bekas");
    if(sort==="price_asc") list.sort((a,b)=>a.price_min-b.price_min);
    if(sort==="price_desc") list.sort((a,b)=>b.price_min-a.price_min);
    if(sort==="sold") list.sort((a,b)=>b.sold-a.sold);
    if(sort==="rating") list.sort((a,b)=>b.rating-a.rating);
    return list;
  },[cat,search,sort,readyOnly,verifiedOnly,codOnly,freeShipOnly,flashOnly,bekasOnly]);
  const setCat=(slug:string)=>{
    const p=new URLSearchParams(searchParams.toString());
    if(slug==="all") p.delete("category"); else p.set("category",slug);
    router.push(`/products?${p.toString()}`);
  }
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      <div className="flex gap-2 text-[11px] tracking-wide text-neutral-500 uppercase"><Link href="/" className="hover:text-black">Home</Link> / <span className="text-black font-bold">Produk</span> {cat!=="all" && <span>/ {categories.find(c=>c.slug===cat)?.name}</span>} {search && <span>/ Cari: "{search}"</span>}</div>
      <div className="mt-4 grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-white border border-neutral-200 p-4">
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold">Kategori</h3>
            <div className="mt-3 space-y-1 max-h-[420px] overflow-y-auto">
              <button onClick={()=>setCat("all")} className={`w-full text-left px-3 py-2 text-[11px] tracking-[0.08em] uppercase font-bold ${cat==="all"?"bg-black text-white":"hover:bg-neutral-100 border border-neutral-200"}`}>Semua Kategori</button>
              {categories.map(c=>(
                <button key={c.slug} onClick={()=>setCat(c.slug)} className={`w-full text-left px-3 py-2 text-[11px] uppercase flex justify-between ${cat===c.slug?"bg-black text-white":"hover:bg-neutral-100 border border-neutral-200"}`}><span>{c.name}</span><span className="text-[10px] opacity-60">{c.count}</span></button>
              ))}
            </div>
            {search && <button onClick={()=>{const p=new URLSearchParams(searchParams.toString()); p.delete("search"); router.push(`/products?${p.toString()}`)}} className="mt-3 text-[11px] underline">Hapus pencarian "{search}"</button>}
          </div>
          <div className="bg-white border border-neutral-200 p-4">
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold">Filter</h3>
            <div className="mt-3 space-y-2 text-[12px]">
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={readyOnly} onChange={e=>setReadyOnly(e.target.checked)} className="accent-black"/> Ready Stock</label>
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)} className="accent-black"/> Toko Verified / Mall</label>
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={freeShipOnly} onChange={e=>setFreeShipOnly(e.target.checked)} className="accent-black"/> Gratis Ongkir</label>
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={flashOnly} onChange={e=>setFlashOnly(e.target.checked)} className="accent-black"/> ⚡ Flash Sale</label>
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={bekasOnly} onChange={e=>setBekasOnly(e.target.checked)} className="accent-black"/> Barang Bekas</label>
              <label className="flex gap-2 cursor-pointer"><input type="checkbox" checked={codOnly} onChange={e=>setCodOnly(e.target.checked)} className="accent-black"/> Bisa COD</label>
            </div>
          </div>
        </aside>
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white border border-neutral-200 p-4 flex flex-wrap justify-between gap-3 items-center">
            <div className="text-[12px]"><span className="font-bold">{display.length}</span> produk ditemukan {cat!=="all" && <span>• <span className="font-bold uppercase">{categories.find(c=>c.slug===cat)?.name}</span></span>} {search && <span>• Cari: <b>"{search}"</b></span>}</div>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="border border-black px-3 py-1.5 text-[11px] bg-white uppercase tracking-wide">
              <option value="recom">Rekomendasi</option>
              <option value="sold">Terlaris</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
          {loading && display.length===0 ? (
            <div className="text-center py-16 border border-neutral-200 mt-4 bg-white text-[11px] tracking-widest uppercase text-neutral-500">Memuat dari database...</div>
          ): display.length===0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-300 mt-4 bg-white">
              <div className="text-[12px] tracking-widest uppercase font-bold">Tidak ada produk</div>
              <div className="text-[12px] text-neutral-500 mt-1">Coba ubah kategori, kata kunci, atau matikan filter</div>
              <button onClick={()=>router.push("/products")} className="mt-4 border border-black px-6 py-2 text-[11px] tracking-widest uppercase font-bold">Lihat Semua</button>
            </div>
          ):(
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
              {display.map(p=> <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default function ProductsPage(){
  return <Suspense fallback={<div className="max-w-[1280px] mx-auto px-4 py-10 text-[11px] tracking-widest uppercase">Loading...</div>}><ProductsContent/></Suspense>
}
