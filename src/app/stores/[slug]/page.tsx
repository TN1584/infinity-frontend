"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import { useAllProducts } from "@/components/SellerContext";
import { useCatalog } from "@/components/CatalogContext";
import ProductCard from "@/components/ProductCard";

const slugify=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function StoreDetail(){
  const {slug}=useParams<{slug:string}>();
  const products:any[]=useAllProducts();
  const {stores:dbStores, loading}=useCatalog();
  const store = dbStores.find((s:any)=>s.slug===slug);
  const storeProducts = store ? products.filter((p:any)=>p.store.name===store.name) : [];
  const fallbackName = store ? null : products.find((p:any)=>slugify(p.store.name)===slug)?.store;

  if(loading && !store && !fallbackName) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center text-[11px] tracking-widest uppercase text-neutral-500">Memuat toko dari database...</div>
  );

  if(!store && !fallbackName) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <div className="text-[11px] tracking-widest uppercase font-bold">Toko tidak ditemukan</div>
      <Link href="/suppliers" className="inline-block mt-4 bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Semua Toko</Link>
    </div>
  );

  const s = store || { name: fallbackName!.name, slug, city: fallbackName!.city, badge: (fallbackName!.badge as string)?.toUpperCase()||"VERIFIED", rating: 4.8, years: 1, products: storeProducts.length, response: "95%", avatar: 0, logo: `https://picsum.photos/seed/${slug}-logo/100/100`, banner: `https://picsum.photos/seed/${slug}-store/800/200` };
  const list = storeProducts.length>0 ? storeProducts : products.filter((p:any)=>p.store.name===s.name);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="text-[11px] tracking-wide text-neutral-500 uppercase"><Link href="/" className="hover:text-black">Home</Link> / <Link href="/suppliers" className="hover:text-black">Toko</Link> / <span className="text-black font-bold">{s.name}</span></div>
        <div className="mt-3 bg-white border border-neutral-200 overflow-hidden">
          <img src={s.banner} className="w-full h-36 object-cover" alt={s.name}/>
          <div className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
            <img src={(s as any).logo || `https://i.pravatar.cc/100?img=${(s as any).avatar||10}`} className="w-16 h-16 rounded-full border-2 border-white -mt-12 shadow bg-white object-cover" alt={s.name}/>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold tracking-tight">{s.name}</h1>
                <span className="text-[9px] tracking-widest font-bold border border-black px-1.5 py-0.5">{s.badge}</span>
              </div>
              <div className="text-[12px] text-neutral-500 mt-0.5">{s.city} • {s.years} tahun • ★ {s.rating} • {s.response} respon chat</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>alert('Follow toko — tersimpan!')} className="border border-black px-5 py-2.5 text-[11px] tracking-widest uppercase font-bold">+ Follow</button>
              <button onClick={()=>alert('Chat toko — hubungi via RFQ')} className="bg-black text-white px-5 py-2.5 text-[11px] tracking-widest uppercase font-bold">Chat</button>
            </div>
          </div>
          <div className="grid grid-cols-4 text-center border-t border-neutral-200 text-[12px]">
            {[["Produk", list.length],["Rating", s.rating],["Respon", s.response],["Kota", s.city]].map(([l,v])=>(
              <div key={l} className="py-3 border-r last:border-0 border-neutral-100"><div className="font-bold">{v}</div><div className="text-neutral-500 text-[10px] uppercase tracking-widest">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white border border-neutral-200 p-5">
          <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">Semua Produk ({list.length})</h2>
          {list.length===0 ? (
            <div className="text-[12px] text-neutral-500 mt-3">Belum ada produk dari toko ini. <Link href="/products" className="underline">Lihat semua produk →</Link></div>
          ):(
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
              {list.map((p:any)=> <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
