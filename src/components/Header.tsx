"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";
import { useCatalog } from "./CatalogContext";
import { useSeller } from "./SellerContext";

export default function Header(){
  const [q,setQ]=useState("");
  const router=useRouter();
  const searchParams=useSearchParams();
  const pathname=usePathname();
  const {count}=useCart();
  const {count:wishCount}=useWishlist();
  const {user, isLogged, logout}=useAuth();
  const {categories}=useCatalog();
  const {unread}=useSeller();
  const activeCat=searchParams.get("category")||"all";
  const scrollRef=useRef<HTMLDivElement>(null);
  const [canLeft,setCanLeft]=useState(false);
  const [canRight,setCanRight]=useState(false);
  const [page,setPage]=useState(0);
  const [pageCount,setPageCount]=useState(1);
  const update=()=>{
    const el=scrollRef.current;
    if(!el) return;
    setCanLeft(el.scrollLeft>8);
    setCanRight(el.scrollLeft+el.clientWidth<el.scrollWidth-8);
    const cnt=Math.max(1,Math.ceil(el.scrollWidth/el.clientWidth));
    setPageCount(cnt);
    setPage(Math.min(Math.round(el.scrollLeft/el.clientWidth),cnt-1));
  };
  useEffect(()=>{
    update();
    const el=scrollRef.current;
    if(!el) return;
    el.addEventListener("scroll",update,{passive:true});
    window.addEventListener("resize",update);
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>{ el.removeEventListener("scroll",update); window.removeEventListener("resize",update); ro.disconnect(); };
  },[pathname,activeCat]);
  const scrollBy=(d:number)=>scrollRef.current?.scrollBy({left:d,behavior:"smooth"});
  const goPage=(p:number)=>scrollRef.current?.scrollTo({left:p*scrollRef.current.clientWidth,behavior:"smooth"});
  const doSearch=()=>{
    const s=q.trim();
    const p=new URLSearchParams(searchParams.toString());
    if(s) p.set("search",s); else p.delete("search");
    if(p.get("category")){}else if(s) p.delete("category");
    router.push(`/products?${p.toString()}`);
  }
  const onKey=(e:React.KeyboardEvent)=>{ if(e.key==="Enter") doSearch(); }
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-black text-white text-center text-[11px] tracking-[0.12em] uppercase py-2 px-4">
        <Link href="/flash-sale" className="hover:underline">⚡ Flash Sale s/d 90%</Link>
        <span className="hidden sm:inline"> • Gratis Ongkir Min. 50rb • </span> Kode: <b>PANEN10</b>
      </div>
      <div className="border-b border-neutral-200">
        <div className="max-w-[1280px] mx-auto px-4 h-[76px] flex items-center gap-6">
          <Link href="/" className="shrink-0 flex items-center">
            <img src="/logo.jpeg" alt="INFINITY" className="h-9 w-32 sm:h-11 sm:w-40 object-cover object-center mt-4 mix-blend-multiply" />
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-[11px] tracking-[0.14em] font-semibold uppercase ml-2">
            {categories.slice(0,4).map(c=>(
              <Link key={c.slug} href={`/products?category=${c.slug}`} className={`hover:opacity-60 ${activeCat===c.slug?"border-b-2 border-black":""}`}>{c.name.split(" ")[0]}</Link>
            ))}
            <Link href="/flash-sale" className="text-red-600 hover:opacity-60">⚡Flash</Link>
          </nav>
          <div className="flex-1 flex justify-center max-w-[560px] mx-auto">
            <div className="flex w-full h-10 border border-black">
              <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKey} placeholder="Cari HP, fashion, beras, bunga..." className="flex-1 px-4 text-[13px] placeholder:text-neutral-400 focus:outline-none" />
              <button onClick={doSearch} className="bg-black text-white px-6 text-[11px] tracking-[0.14em] font-bold uppercase hover:bg-zinc-800">Cari</button>
            </div>
          </div>
          <div className="flex items-center gap-5 shrink-0 text-[11px]">
            <Link href="/rfq" className="hidden md:block tracking-[0.1em] uppercase font-semibold hover:opacity-60">RFQ</Link>
            {user?.role==="admin" ? (
              <Link href="/admin" className="hidden md:block tracking-[0.1em] uppercase font-bold text-red-600 hover:opacity-60">Admin</Link>
            ): user && ["seller","supplier","petani","preloved","florist"].includes(user.role) ? (
              <Link href="/seller" className="hidden md:block tracking-[0.1em] uppercase font-semibold hover:opacity-60 relative">Toko Saya{unread>0 && <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[9px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-1">{unread}</span>}</Link>
            ):(
              <Link href="/seller/register" className="hidden md:block tracking-[0.1em] uppercase font-semibold hover:opacity-60">Jual</Link>
            )}
            {isLogged ? (
              <div className="hidden md:flex items-center gap-2 border border-neutral-200 px-3 py-1">
                <span className="text-[11px] font-bold truncate max-w-[100px]">{user?.name}</span>
                <button onClick={logout} className="text-[10px] tracking-widest uppercase border border-black px-2 py-1 font-bold">Keluar</button>
              </div>
            ):(
              <Link href="/login" className="hidden md:flex flex-col items-center gap-1 hover:opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span className="text-[9px] tracking-widest uppercase hidden lg:block">Masuk</span>
              </Link>
            )}
            <Link href="/wishlist" className="flex flex-col items-center gap-1 hover:opacity-60 relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishCount>0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1">{wishCount}</span>}
              <span className="text-[9px] tracking-widest uppercase hidden lg:block">Wishlist</span>
            </Link>
            <Link href="/cart" className="flex flex-col items-center gap-1 relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {count>0 && <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1">{count}</span>}
              <span className="text-[9px] tracking-widest uppercase hidden lg:block">Bag</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-4 h-9 flex items-center text-[11px] tracking-[0.12em] uppercase font-medium">
          <button aria-label="prev" onClick={()=>scrollBy(-scrollRef.current!.clientWidth*0.85)} className={`hidden max-md:flex shrink-0 w-7 h-7 items-center justify-center border border-neutral-200 bg-white -mr-1 z-10 ${canLeft?"opacity-100":"opacity-0 pointer-events-none"} transition`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="relative flex-1 flex items-center overflow-hidden">
            {canLeft && <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-[1] md:hidden" />}
            <div ref={scrollRef} className="flex-1 flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2">
              <Link href="/products" className={`whitespace-nowrap snap-start h-9 flex items-center border-b-2 shrink-0 ${pathname==="/products" && !searchParams.get("category")?"border-black text-black":"border-transparent text-neutral-600 hover:text-black hover:border-black"} transition`}>Semua</Link>
              {categories.map(c=>(
                <Link key={c.slug} href={`/products?category=${c.slug}`} className={`whitespace-nowrap snap-start h-9 flex items-center border-b-2 shrink-0 ${activeCat===c.slug?"border-black text-black":"border-transparent text-neutral-600 hover:text-black hover:border-black"} transition`}>
                  {c.name}
                </Link>
              ))}
            </div>
            {canRight && <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-[1] md:hidden" />}
          </div>
          <button aria-label="next" onClick={()=>scrollBy(scrollRef.current!.clientWidth*0.85)} className={`hidden max-md:flex shrink-0 w-7 h-7 items-center justify-center border border-neutral-200 bg-white -ml-1 z-10 ${canRight?"opacity-100":"opacity-0 pointer-events-none"} transition`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <Link href="/suppliers" className="whitespace-nowrap hidden md:flex items-center gap-1 text-neutral-500 hover:text-black ml-4 sm:ml-6 shrink-0">Supplier <span className="bg-black text-white text-[8px] px-1 py-0.5 tracking-widest">VERIFIED</span></Link>
        </div>
        {pageCount>1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 pb-2">
            {Array.from({length:pageCount}).map((_,i)=>(
              <button key={i} onClick={()=>goPage(i)} aria-label={`page ${i+1}`} className={`transition-all rounded-full ${i===page?"w-5 h-1.5 bg-black":"w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-400"}`} />
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
