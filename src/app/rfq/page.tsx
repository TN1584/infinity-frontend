"use client";
import { useState } from "react";
import { useCatalog } from "@/components/CatalogContext";
import { useAuth } from "@/components/AuthContext";
import { apiPost, toRfq } from "@/lib/api";
export default function RfqPage(){
  const {rfqs:dbRfqs, loading, refresh}=useCatalog();
  const {isLogged}=useAuth();
  const [mine,setMine]=useState<any[]>([]);
  const [busy,setBusy]=useState(false);
  const list=[...mine, ...dbRfqs];
  const [form,setForm]=useState({title:"",qty:100,unit:"kg",desc:""});
  const submit = async(e:React.FormEvent)=>{
    e.preventDefault();
    if(isLogged){
      setBusy(true);
      try{
        const created=await apiPost<any>("/rfqs",{title:form.title, quantity:form.qty, unit:form.unit, description:form.desc});
        setMine([toRfq(created),...mine]);
        setForm({title:"",qty:100,unit:"kg",desc:""});
        alert("RFQ tersimpan di database! Penjual akan memberi penawaran.");
      }catch(err:any){ alert(err?.message || "Gagal mengirim RFQ"); }
      finally{ setBusy(false); }
      return;
    }
    const n={id:Date.now(), title:form.title, qty:form.qty, unit:form.unit, budget:"Menunggu quote", quotes:0, time:"Baru saja", buyer:"Anda", avatar:"https://i.pravatar.cc/100?img=8"};
    setMine([n,...mine]); setForm({title:"",qty:100,unit:"kg",desc:""}); alert("RFQ dicatat lokal (masuk untuk menyimpan permanen). Penjual akan memberi penawaran.");
  }
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <div className="bg-black text-white p-8">
        <h1 className="text-[22px] font-bold tracking-tight">Request for Quotation (RFQ)</h1>
        <p className="text-[13px] opacity-70 mt-1">Satu permintaan, dapatkan banyak penawaran dari petani, preloved & florist terverifikasi. Gratis.</p>
        <div className="mt-3 flex gap-4 text-[11px] tracking-widest uppercase opacity-60"><span>✓ 1 RFQ = 10+ Quotes</span><span>✓ Respon 6 jam</span><span>✓ Gratis</span></div>
      </div>
      <div className="mt-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 h-fit">
          <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold">Buat RFQ Baru</h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Contoh: Butuh 500kg Cabai Merah" className="w-full border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black focus:outline-none"/>
            <div className="flex gap-2"><input type="number" value={form.qty} onChange={e=>setForm({...form,qty:parseInt(e.target.value)||0})} className="flex-1 border border-neutral-300 px-3 py-2.5 text-[13px]"/><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} className="border border-neutral-300 px-3 py-2.5 text-[13px] bg-white"><option value="kg">kg</option><option value="karung">karung</option><option value="buket">buket</option><option value="papan">papan</option><option value="unit">unit</option><option value="pot">pot</option></select></div>
            <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Deskripsi kebutuhan, spesifikasi, deadline..." rows={4} className="w-full border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black focus:outline-none"/>
            <button type="submit" disabled={busy} className="w-full bg-black text-white py-3 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-zinc-800 disabled:opacity-60">{busy?"Mengirim...":"Kirim RFQ Gratis"}</button>
            <p className="text-[11px] text-neutral-500 text-center">Penjual terverifikasi akan kirim penawaran dalam 24 jam</p>
          </form>
          <div className="mt-6 bg-[#f5f5f5] border border-neutral-200 p-4">
            <h3 className="text-[11px] tracking-[0.14em] uppercase font-bold">Cara Kerja RFQ</h3>
            <ol className="mt-2 space-y-2 text-[12px] text-neutral-600">
              <li>1. Tulis kebutuhan & qty</li><li>2. RFQ disebar ke penjual relevan</li><li>3. Terima quotes & bandingkan harga</li><li>4. Chat & deal langsung</li>
            </ol>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="bg-white border border-neutral-200 p-4 flex justify-between items-center">
            <h2 className="text-[11px] tracking-[0.14em] uppercase font-bold">RFQ Marketplace • {list.length} permintaan aktif</h2>
            <span className="text-[10px] tracking-widest uppercase bg-black text-white px-3 py-1 font-bold">Live</span>
          </div>
          <div className="space-y-3 mt-4">
            {list.map(r=>(
              <div key={r.id} className="bg-white border border-neutral-200 p-4 hover:border-black transition">
                <div className="flex gap-3">
                  <img src={r.avatar} className="w-10 h-10 rounded-full grayscale"/>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px]">{r.title}</div>
                    <div className="text-[11px] text-neutral-500 mt-1">Qty: {r.qty} {r.unit} • Budget: {r.budget} • {r.time}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] border border-neutral-300 px-2 py-1">{r.buyer}</span>
                      <span className="text-[11px] border border-black px-2 py-1 font-bold">{r.quotes} quotes</span>
                    </div>
                  </div>
                  <button onClick={()=>alert('Fitur kirim quote segera hadir')} className="self-start bg-black text-white px-4 py-2 text-[11px] tracking-widest uppercase font-bold shrink-0">Kirim Quote</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
