"use client";
import Link from "next/link";
import { useCatalog } from "@/components/CatalogContext";
export default function SuppliersPage(){
  const {stores:dbStores, loading}=useCatalog();
  const all:any[]=dbStores;
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <h1 className="text-[11px] tracking-[0.16em] uppercase font-bold">Toko & Supplier Terverifikasi</h1>
      <p className="text-[11px] text-neutral-500 mt-1 tracking-wide uppercase">Data langsung dari database • {all.length} toko</p>
      {loading && all.length===0 && <div className="mt-6 bg-white border border-neutral-200 p-8 text-center text-[11px] tracking-widest uppercase text-neutral-500">Memuat toko dari database...</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {all.map(s=>(
          <div key={s.slug} className="bg-white border border-neutral-200 overflow-hidden hover:border-black transition">
            <img src={s.banner} className="w-full h-28 object-cover" alt={s.name}/>
            <div className="p-4">
              <div className="flex gap-3">
                <img src={s.logo} className="w-12 h-12 rounded-full border-2 border-white -mt-8 shadow bg-white object-cover" alt={s.name}/>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[12px] tracking-wide uppercase truncate">{s.name}</div>
                  <div className="text-[11px] text-neutral-500">{s.city} • {s.years} tahun</div>
                </div>
                <span className="h-fit text-[9px] tracking-widest px-2 py-1 font-bold border border-black">{s.badge}</span>
              </div>
              <div className="mt-3 flex justify-between text-[11px] text-neutral-600">
                <span>★ {s.rating} Rating</span><span>↻ {s.response} Respon</span><span>✓ Verified</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/stores/${s.slug}`} className="flex-1 border border-black text-center py-2 text-[11px] tracking-widest uppercase font-bold hover:bg-black hover:text-white transition">Lihat Toko</Link>
                <button onClick={()=>alert('Chat toko — segera hadir full chat')} className="flex-1 bg-black text-white py-2 text-[11px] tracking-widest uppercase font-bold">Chat</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
