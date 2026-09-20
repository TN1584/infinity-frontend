"use client";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/data";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const tabs=["Semua","Belum Bayar","Dikemas","Dikirim","Selesai"];

function OrdersContent(){
  const {orders}=useCart();
  const sp=useSearchParams();
  const success=sp.get("success");
  const [active,setActive]=useState("Semua");
  const filtered=active==="Semua" ? orders : orders.filter(o=>o.status===active);
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        {success && (
          <div className="bg-white border border-black p-6 text-center">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto text-xl">✓</div>
            <div className="text-[16px] font-bold mt-3">Pesanan Berhasil Dibuat!</div>
            <div className="text-[13px] text-neutral-500 mt-1">No. Pesanan: <b className="text-black">{success}</b> • Status: Belum Bayar</div>
            <div className="text-[11px] text-neutral-500 mt-2">Lakukan pembayaran sesuai metode yang dipilih. Penjual akan proses dalam 6 jam.</div>
          </div>
        )}

        <div className="mt-4 bg-white border border-neutral-200">
          <div className="px-4 py-4 flex gap-6 overflow-x-auto no-scrollbar border-b border-neutral-200">
            {tabs.map(t=>(
              <button key={t} onClick={()=>setActive(t)} className={`text-[11px] tracking-[0.12em] uppercase font-bold whitespace-nowrap pb-2 border-b-2 ${active===t?"border-black text-black":"border-transparent text-neutral-500 hover:text-black"}`}>{t}</button>
            ))}
            <Link href="/products" className="ml-auto hidden md:block text-[11px] tracking-widest uppercase border border-black px-4 py-1.5 font-bold">Belanja Lagi</Link>
          </div>

          {filtered.length===0 ? (
            <div className="text-center py-16">
              <div className="text-5xl grayscale opacity-50">📦</div>
              <div className="text-[13px] font-bold mt-4">Belum ada pesanan</div>
              <div className="text-[12px] text-neutral-500 mt-1">Pesanan dengan status "{active}" akan muncul di sini</div>
              <Link href="/products" className="inline-block mt-4 bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Mulai Belanja</Link>
            </div>
          ):(
            <div className="divide-y divide-neutral-200">
              {filtered.map(o=>(
                <div key={o.id} className="p-5">
                  <div className="flex flex-wrap gap-3 justify-between items-center text-[11px]">
                    <span className="tracking-widest uppercase font-bold">Pesanan #{o.id} • {new Date(o.date).toLocaleDateString("id-ID")}</span>
                    <span className={`px-2 py-1 border text-[10px] tracking-widest uppercase font-bold ${o.status==="Belum Bayar"?"bg-amber-100 border-amber-300 text-amber-800":"bg-emerald-100 border-emerald-300"}`}>{o.status}</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {o.items.map(it=>(
                      <div key={it.slug} className="flex gap-3 items-center">
                        <img src={it.image} className="w-14 h-14 object-cover border border-neutral-200 bg-[#f5f5f5]"/>
                        <div className="flex-1 min-w-0"><div className="text-[13px] line-clamp-1">{it.title}</div><div className="text-[11px] text-neutral-500">{it.store} • x{it.qty}</div></div>
                        <div className="text-[13px] font-bold">{formatPrice(it.price*it.qty)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-[#fafafa] border border-neutral-200 p-3 flex flex-col md:flex-row gap-3 justify-between text-[12px]">
                    <div className="text-neutral-500">Alamat: {o.address.slice(0,60)}... • Kurir: {o.courier} • Bayar: {o.payment.toUpperCase()} {o.voucher>0 && `• Voucher -${formatPrice(o.voucher)}`}</div>
                    <div className="font-bold text-right">Total: {formatPrice(o.total)} <span className="font-normal text-neutral-500">({o.items.reduce((s,i)=>s+i.qty,0)} produk)</span></div>
                  </div>
                  {(o as any).notes && Object.entries((o as any).notes as Record<string,string>).filter(([,v])=>v).map(([store,note])=>(
                    <div key={store} className="mt-2 text-[11px] text-neutral-500 border-l-2 border-black pl-2">Pesan ke {store}: "{note}"</div>
                  ))}
                  <div className="mt-3 flex gap-2 justify-end">
                    <button onClick={()=>alert('Fitur lacak pesanan segera hadir')} className="border border-neutral-300 px-4 py-2 text-[11px] tracking-widest uppercase font-bold">Lacak</button>
                    <button onClick={()=>alert('Hubungi penjual via Chat RFQ')} className="bg-black text-white px-4 py-2 text-[11px] tracking-widest uppercase font-bold">Chat Penjual</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-white border border-neutral-200 p-4 flex gap-4 items-center text-[11px]">
          <span className="font-bold tracking-widest uppercase">Butuh Bantuan?</span>
          <span className="text-neutral-500 hidden md:inline">Hubungi 1500-123 • Chat 24 jam • Garansi 100% Ori • 30 Hari Retur</span>
          <Link href="/cart" className="ml-auto border border-black px-4 py-2 tracking-widest uppercase font-bold">Ke Keranjang</Link>
        </div>
      </div>
    </div>
  )
}
export default function OrdersPage(){
  return <Suspense fallback={<div className="p-8 text-[11px] tracking-widest uppercase">Loading...</div>}><OrdersContent/></Suspense>
}
