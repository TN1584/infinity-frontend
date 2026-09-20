"use client";
import { useParams } from "next/navigation";
import { formatPrice, salePrice, discountPct, formatSold } from "@/lib/data";
import { fetchProductDetail } from "@/lib/api";
import { useCatalog } from "@/components/CatalogContext";
import { useAllProducts } from "@/components/SellerContext";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail(){
  const {slug}=useParams<{slug:string}>();
  const products:any[]=useAllProducts();
  const {categories, loading}=useCatalog();
  const [detail,setDetail]=useState<any>(null);
  useEffect(()=>{
    let on=true;
    if(slug) fetchProductDetail(slug as string).then(d=>{ if(on) setDetail(d); }).catch(()=>{});
    return ()=>{ on=false; };
  },[slug]);
  const p = products.find((x:any)=>x.slug===slug) || detail || null;
  const {add}=useCart();
  const {toggle, has}=useWishlist();
  const [qty,setQty]=useState(1);
  const [img,setImg]=useState(0);
  const [selVar,setSelVar]=useState<Record<string,string>>({});
  useEffect(()=>{ if(p) { setQty(p.moq); setImg(0); } },[p?.slug]);
  const tierPrice = p ? (p.tier.find((t:any)=> qty>=t.min && qty<=t.max)?.price || salePrice(p)) : 0;
  const disc = p ? discountPct(p) : 0;
  const reviews = detail?.reviews?.length ? detail.reviews : [];
  const reviewTotal = detail?.review_count ?? p?.review_count ?? reviews.length;
  const description = detail?.description || p?.description || "";
  const specs = detail?.specs || p?.specs || null;
  const related=useMemo(()=>p?products.filter((x:any)=>x.category===p.category && x.slug!==p.slug).slice(0,6):[],[p?.slug]);
  const moreFromStore=useMemo(()=>p?products.filter((x:any)=>x.store.name===p.store.name && x.slug!==p.slug).slice(0,4):[],[p?.slug]);
  const catName = p ? (categories.find((c:any)=>c.slug===p.category)?.name || p.categoryName || p.category) : "";
  const wished = p ? has(p.slug) : false;
  const varLabel = Object.values(selVar).filter(Boolean).join(", ") || "Default";

  if(loading && !p) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center text-[11px] tracking-widest uppercase text-neutral-500">Memuat produk dari database...</div>
  );
  if(!p) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <div className="text-[11px] tracking-widest uppercase font-bold">Produk tidak ditemukan</div>
      <p className="text-[13px] text-neutral-500 mt-2">Produk mungkin sudah dihapus dari database.</p>
      <Link href="/products" className="inline-block mt-6 bg-black text-white px-6 py-3 text-[11px] tracking-widest uppercase font-bold">Lihat Katalog</Link>
    </div>
  );

  const doAdd=(goCart:boolean)=>{
    add({slug:p.slug, title:p.title+(varLabel!=="Default"?` (${varLabel})`:""), price:tierPrice, qty, image:p.images[0], store:p.store.name});
    if(goCart) location.href='/cart'; else alert('Ditambahkan ke keranjang!');
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="text-[11px] tracking-wide text-neutral-500 uppercase"><Link href="/" className="hover:text-black">Home</Link> / <Link href="/products" className="hover:text-black">Produk</Link> / <Link href={`/products?category=${p.category}`} className="hover:text-black">{catName}</Link> / <span className="text-black font-bold truncate">{p.title.slice(0,40)}</span></div>

        <div className="mt-3 bg-white border border-neutral-200 grid lg:grid-cols-12 gap-0">
          <div className="lg:col-span-5 p-4 lg:border-r border-neutral-200">
            <div className="aspect-square bg-[#f5f5f5] overflow-hidden relative">
              <img src={p.images[img]} alt={p.title} className="w-full h-full object-cover"/>
              {disc>0 && <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-1">-{disc}%</span>}
              {p.isFlashSale && <span className="absolute bottom-3 left-3 bg-black text-white text-[10px] tracking-widest uppercase font-bold px-2 py-1">⚡ Flash Sale</span>}
            </div>
            <div className="flex gap-2 mt-3">
              {p.images.map((im:string,i:number)=>(
                <button key={i} onClick={()=>setImg(i)} className={`w-16 h-16 overflow-hidden border-2 ${img===i?"border-black":"border-neutral-200"}`}><img src={im} className="w-full h-full object-cover"/></button>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-[11px] text-neutral-500">
              <span>🚚 {p.freeShipping?"Gratis Ongkir":"Ongkir mulai Rp8rb"}</span>
              <span>🛡️ {p.has_assurance?"100% Ori":"Garansi Toko"}</span>
              <span>↩️ 30 Hari Retur</span>
            </div>
          </div>

          <div className="lg:col-span-4 p-5">
            {p.store?.badge==="mall" && <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5">Mall</span>}
            <h1 className="text-[18px] font-medium leading-snug mt-1">{p.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-[12px]">
              <span className="font-bold border-b border-black">★ {p.rating}</span>
              <span className="text-neutral-400">|</span><span className="text-neutral-500">{formatSold(p.sold)} Terjual</span>
              <span className="text-neutral-400">|</span><span className="text-neutral-500">{reviewTotal} Ulasan</span>
            </div>
            <div className={`mt-3 p-4 ${p.isFlashSale?"bg-red-600 text-white":"bg-[#fafafa] border border-neutral-200"}`}>
              <div className="flex items-baseline gap-2">
                <span className={`text-[26px] font-black ${p.isFlashSale?"":"text-red-600"}`}>{formatPrice(tierPrice)}</span>
                {disc>0 && <span className="text-[12px] line-through opacity-60">{formatPrice(p.price_max)}</span>}
                {disc>0 && <span className="text-[11px] font-bold">-{disc}%</span>}
              </div>
              <div className="text-[11px] opacity-70 mt-1">MOQ {p.moq} {p.unit} • Stok {p.stock} • Kondisi: {p.condition||"Baru"}</div>
              {p.tier.length>1 && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  {p.tier.map((t:any)=>(
                    <div key={t.min} className={`border p-1.5 text-center ${qty>=t.min&&qty<=t.max?"bg-black text-white border-black":"bg-white text-black"}`}>
                      <div className="font-bold">{t.min}-{t.max}</div><div>{formatPrice(t.price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {p.variants?.map((v:any)=>(
              <div key={v.name} className="mt-4">
                <div className="text-[12px] text-neutral-500">{v.name}: <b className="text-black">{selVar[v.name]||"Pilih"}</b></div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {v.options.map((o:string)=>(
                    <button key={o} onClick={()=>setSelVar(s=>({...s,[v.name]:o}))} className={`px-3 py-1.5 text-[12px] border ${selVar[v.name]===o?"border-black bg-black text-white font-bold":"border-neutral-300 hover:border-black"}`}>{o}</button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 flex items-center gap-3">
              <span className="text-[12px] text-neutral-500">Jumlah</span>
              <div className="flex items-center border border-neutral-300">
                <button onClick={()=>setQty(Math.max(p.moq, qty-1))} className="w-9 h-9 hover:bg-neutral-100">−</button>
                <span className="w-12 text-center text-[13px] font-bold">{qty}</span>
                <button onClick={()=>setQty(Math.min(p.stock, qty+1))} className="w-9 h-9 hover:bg-neutral-100">+</button>
              </div>
              <span className="text-[11px] text-neutral-500">Stok {p.stock}</span>
            </div>
            <div className="text-[13px] mt-2">Subtotal: <span className="font-black text-red-600">{formatPrice(tierPrice*qty)}</span></div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={()=>doAdd(false)} className="border-2 border-black py-3 text-[11px] tracking-widest uppercase font-bold hover:bg-neutral-100">+ Keranjang</button>
              <button onClick={()=>doAdd(true)} className="bg-black text-white py-3 text-[11px] tracking-widest uppercase font-bold hover:bg-zinc-800">Beli Sekarang</button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={()=>toggle(p.slug)} className={`border py-2.5 text-[11px] tracking-widest uppercase font-bold ${wished?"border-red-600 text-red-600":"border-neutral-300"}`}>{wished?"♥ Wishlist ✓":"♡ Wishlist"}</button>
              <button onClick={()=>alert('Chat penjual — hubungi via halaman RFQ/Supplier')} className="border border-neutral-300 py-2.5 text-[11px] tracking-widest uppercase font-bold">💬 Chat</button>
            </div>
          </div>

          <div className="lg:col-span-3 p-4 lg:border-l border-neutral-200 bg-[#fafafa] space-y-3">
            <div className="bg-white border border-neutral-200 p-4">
              <div className="flex gap-3">
                <img src={`https://i.pravatar.cc/100?img=${p.id%60+1}`} className="w-12 h-12 rounded-full" alt={p.store.name}/>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] truncate">{p.store.name}</div>
                  <div className="text-[11px] text-neutral-500">{p.store.city} • {p.store.badge==="gold"?"🏆 Gold":p.store.badge==="mall"?"🏬 Mall":"✓ Verified"}</div>
                  <div className="text-[11px] text-amber-500">★ {p.rating} • 98% Respon</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={()=>alert('Follow toko — tersimpan!')} className="border border-black py-2 text-[11px] tracking-widest uppercase font-bold">Follow</button>
                <Link href={`/stores/${p.store.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} className="bg-black text-white text-center py-2 text-[11px] tracking-widest uppercase font-bold">Kunjungi</Link>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 p-4">
              <h3 className="font-bold text-[12px] tracking-widest uppercase">Jaminan INFINITY</h3>
              <ul className="mt-2 space-y-1.5 text-[12px] text-neutral-600">
                <li>🛡️ 100% Ori / uang kembali</li>
                <li>🚚 {p.freeShipping?"Gratis ongkir":"Pengiriman terverifikasi"}</li>
                <li>↩️ 30 hari retur mudah</li>
                <li>💬 COD & pembayaran aman</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ULASAN */}
        <div className="mt-4 bg-white border border-neutral-200 p-5">
          <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">Ulasan Pembeli ({reviewTotal})</h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[28px] font-black">★ {p.rating}</span>
            <span className="text-[12px] text-neutral-500">{Math.round(p.rating/5*100)}% pembeli puas • {formatSold(p.sold)} terjual</span>
          </div>
          {reviews.length===0 && <div className="mt-4 text-[13px] text-neutral-500 border border-dashed border-neutral-300 p-4 text-center">Belum ada ulasan untuk produk ini. Jadilah pembeli pertama yang mengulas!</div>}
          <div className="mt-4 divide-y divide-neutral-100">
            {reviews.map((r:any,i:number)=>(
              <div key={i} className="py-3 flex gap-3">
                <img src={r.avatar} className="w-9 h-9 rounded-full" alt={r.name}/>
                <div className="flex-1">
                  <div className="text-[12px] font-bold">{r.name} <span className="font-normal text-neutral-400">• {r.date} • {r.variant}</span></div>
                  <div className="text-[12px] text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>
                  <p className="text-[13px] text-neutral-700 mt-1">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL */}
        <div className="mt-4 bg-white border border-neutral-200 p-5">
          <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">Detail Produk</h2>
          <p className="text-[13px] text-neutral-600 mt-2 leading-relaxed">{description}</p>
          <div className="mt-3 grid md:grid-cols-2 gap-3 text-[13px]">
            <div className="border border-neutral-200 p-3"><div className="font-bold">Spesifikasi</div><div className="text-neutral-600 mt-1">
              Kategori: {catName}<br/>Kondisi: {p.condition||"Baru"}<br/>MOQ: {p.moq} {p.unit}<br/>Garansi: {p.has_assurance?"Ya":"Toko"}
              {specs && Object.entries(specs).map(([k,v])=><span key={k}><br/>{k}: {String(v)}</span>)}
            </div></div>
            <div className="border border-neutral-200 p-3"><div className="font-bold">Pengiriman</div><div className="text-neutral-600 mt-1">{p.freeShipping?"Gratis ongkir min. Rp50rb":"Reguler/Hemat/Express"}<br/>Dari: {p.store.city}<br/>Estimasi: 1-5 hari<br/>COD: Tersedia</div></div>
          </div>
        </div>

        {related.length>0 && (
          <div className="mt-4 bg-white border border-neutral-200 p-5">
            <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">Produk Terkait</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
              {related.map((r:any)=> <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        )}
        {moreFromStore.length>0 && (
          <div className="mt-4 bg-white border border-neutral-200 p-5">
            <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">Lainnya dari {p.store.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {moreFromStore.map((r:any)=> <ProductCard key={r.id} p={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
