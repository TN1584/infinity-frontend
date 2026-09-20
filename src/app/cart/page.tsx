"use client";
import { useCart } from "@/components/CartContext";
import { formatPrice, vouchers } from "@/lib/data";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CartPage(){
  const {items,remove,update,toggle,toggleStore,toggleAll,selectedTotal,selectedCount,removeSelected}=useCart();
  const router=useRouter();
  const [voucher,setVoucher]=useState("");
  const groups=useMemo(()=>{
    const m=new Map<string,typeof items>();
    items.forEach(i=>{
      if(!m.has(i.store)) m.set(i.store,[]);
      m.get(i.store)!.push(i);
    });
    return Array.from(m.entries());
  },[items]);
  const allSelected=items.length>0 && items.every(i=>i.selected);

  if(items.length===0) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <div className="text-6xl grayscale">🛒</div>
      <h1 className="text-[18px] font-bold tracking-wide uppercase mt-4">Keranjang Kosong</h1>
      <p className="text-[13px] text-neutral-500 mt-1">Tambahkan HP, fashion, elektronik, hasil tani & kebutuhan harianmu</p>
      <Link href="/products" className="inline-block mt-6 bg-black text-white px-8 py-3 text-[11px] tracking-[0.14em] uppercase font-bold">Mulai Belanja</Link>
    </div>
  );

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="flex gap-2 text-[11px] tracking-wide uppercase text-neutral-500"><Link href="/" className="hover:text-black">Home</Link> / <span className="text-black font-bold">Keranjang</span></div>

        <div className="mt-4 bg-white border border-neutral-200 grid grid-cols-12 text-[11px] tracking-[0.08em] uppercase font-bold text-neutral-500 px-4 py-3">
          <div className="col-span-6 flex items-center gap-3">
            <input type="checkbox" checked={allSelected} onChange={e=>toggleAll(e.target.checked)} className="w-4 h-4 accent-black" />
            Produk
          </div>
          <div className="col-span-2 text-center hidden md:block">Harga Satuan</div>
          <div className="col-span-2 text-center">Kuantitas</div>
          <div className="col-span-2 text-center hidden md:block">Total Harga</div>
          <div className="col-span-1 text-center">Aksi</div>
        </div>

        <div className="mt-3 space-y-4">
          {groups.map(([store, list])=>{
            const storeAll=list.every(i=>i.selected);
            return (
              <div key={store} className="bg-white border border-neutral-200">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-[#fafafa]">
                  <input type="checkbox" checked={storeAll} onChange={e=>toggleStore(store, e.target.checked)} className="w-4 h-4 accent-black" />
                  <span className="text-[11px] tracking-widest uppercase font-bold">{store}</span>
                  <span className="text-[10px] border border-black px-1.5 py-0.5 font-bold">VERIFIED</span>
                  <span className="ml-auto text-[11px] text-neutral-500 hidden md:inline">Gratis Ongkir • COD</span>
                </div>
                {list.map(i=>(
                  <div key={i.slug} className="grid grid-cols-12 gap-2 px-4 py-4 items-center border-b border-neutral-100 last:border-0">
                    <div className="col-span-7 md:col-span-6 flex gap-3 items-center">
                      <input type="checkbox" checked={!!i.selected} onChange={()=>toggle(i.slug)} className="w-4 h-4 accent-black shrink-0" />
                      <Link href={`/products/${i.slug}`}><img src={i.image} className="w-20 h-20 object-cover bg-[#f5f5f5] border border-neutral-200" alt={i.title}/></Link>
                      <div className="min-w-0">
                        <Link href={`/products/${i.slug}`} className="text-[13px] leading-snug line-clamp-2 hover:underline">{i.title}</Link>
                        <div className="text-[11px] text-neutral-500 mt-1">{i.store}</div>
                        <div className="md:hidden font-bold text-[12px] mt-1">{formatPrice(i.price)}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center hidden md:block text-[13px]">{formatPrice(i.price)}</div>
                    <div className="col-span-3 md:col-span-2 flex justify-center">
                      <div className="flex items-center border border-neutral-300">
                        <button onClick={()=>update(i.slug, Math.max(1,i.qty-1))} className="w-8 h-8 hover:bg-neutral-100 text-sm">−</button>
                        <span className="w-10 text-center text-[13px] font-medium">{i.qty}</span>
                        <button onClick={()=>update(i.slug,i.qty+1)} className="w-8 h-8 hover:bg-neutral-100 text-sm">+</button>
                      </div>
                    </div>
                    <div className="col-span-2 text-center hidden md:block font-bold text-[13px] text-black">{formatPrice(i.price*i.qty)}</div>
                    <div className="col-span-2 md:col-span-1 text-center">
                      <button onClick={()=>remove(i.slug)} className="text-[11px] tracking-wide uppercase hover:text-red-600">Hapus</button>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-3 border-t border-neutral-200 flex gap-3 items-center bg-[#f5f5f5]">
                  <span className="text-[11px] tracking-widest uppercase font-bold">Voucher Toko</span>
                  <span className="text-[11px] text-neutral-500">Gunakan voucher untuk potongan ongkir</span>
                  <button className="ml-auto text-[11px] tracking-widest uppercase font-bold border border-black px-3 py-1.5 hover:bg-black hover:text-white transition">Pilih Voucher</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 bg-white border border-neutral-200 p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 flex gap-2 items-center w-full">
              <span className="text-[11px] tracking-widest uppercase font-bold shrink-0">Voucher</span>
              <input value={voucher} onChange={e=>setVoucher(e.target.value)} placeholder="Coba: PANEN10 / GRATISONGKIR / FLASH20" className="flex-1 md:max-w-xs border border-neutral-300 px-3 py-2 text-[12px] focus:border-black outline-none uppercase" />
              <button onClick={()=> {
                const v=vouchers.find(x=>x.code===voucher.toUpperCase());
                alert(v ? `${v.code} aktif! Diskon dihitung di Checkout` : "Kode tidak valid. Coba: PANEN10 / GRATISONGKIR / FLASH20");
              }} className="bg-black text-white px-5 py-2 text-[11px] tracking-widest uppercase font-bold">Pakai</button>
            </div>
            <div className="text-[11px] text-neutral-500 hidden md:block">Gratis Ongkir min. 50rb • 30 Hari Retur</div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {vouchers.map(v=>(
              <button key={v.code} onClick={()=>setVoucher(v.code)} className="shrink-0 border border-dashed border-neutral-300 px-3 py-1.5 text-left hover:border-black">
                <div className="text-[11px] font-bold">{v.code}</div>
                <div className="text-[10px] text-neutral-500">{v.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white border border-neutral-200 sticky bottom-0 z-10">
          <div className="px-4 py-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-4 text-[12px]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={allSelected} onChange={e=>toggleAll(e.target.checked)} className="w-4 h-4 accent-black" /> Pilih Semua ({items.length})</label>
              <button onClick={removeSelected} className="text-[11px] tracking-widest uppercase hover:text-red-600">Hapus</button>
              <Link href="/products" className="hidden md:inline text-[11px] tracking-widest uppercase border border-neutral-300 px-3 py-1.5">Lanjut Belanja</Link>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <div className="text-[12px]">Total ({selectedCount} produk): <span className="font-bold text-[16px]">{formatPrice(selectedTotal)}</span></div>
                <div className="text-[11px] text-neutral-500">Belum termasuk ongkir & voucher</div>
              </div>
              <button disabled={selectedCount===0} onClick={()=>router.push("/checkout")} className={`px-8 py-3 text-[11px] tracking-[0.14em] uppercase font-bold ${selectedCount===0?"bg-neutral-300 text-neutral-500 cursor-not-allowed":"bg-black text-white hover:bg-zinc-800"}`}>Checkout</button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-[11px] text-neutral-400">
          <Link href="/orders" className="underline underline-offset-4 hover:text-black">Lihat Pesanan Saya →</Link>
        </div>
      </div>
    </div>
  )
}
