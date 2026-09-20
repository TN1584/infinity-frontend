"use client";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { formatPrice, vouchers } from "@/lib/data";
import { useAllProducts } from "@/components/SellerContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const couriers=[
  {id:"hemat", name:"Hemat", price:8000, eta:"3-5 hari"},
  {id:"reguler", name:"Reguler", price:15000, eta:"1-3 hari"},
  {id:"express", name:"Express", price:25000, eta:"Same day"},
];
const payments=[
  {id:"cod", name:"COD - Bayar di Tempat", desc:"Bayar tunai saat paket tiba"},
  {id:"transfer", name:"Transfer Bank", desc:"BCA / Mandiri / BRI / Virtual Account"},
];
const ADMIN_FEE=450;

export default function CheckoutPage(){
  const {selectedItems, selectedTotal, placeOrder}=useCart();
  const {isLogged}=useAuth();
  const products:any[]=useAllProducts();
  const [orderErr,setOrderErr]=useState("");
  const [placing,setPlacing]=useState(false);
  const router=useRouter();
  const [address,setAddress]=useState("Budi Santoso | 0812-3456-7890 | Jl. Kramat Jati No.12, Pasar Induk, Jakarta Timur 13510");
  const [courierByStore,setCourierByStore]=useState<Record<string,string>>({});
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [payment,setPayment]=useState("cod");
  const [voucher,setVoucher]=useState("PANEN10");
  const [editAddr,setEditAddr]=useState(false);

  const groups=useMemo(()=>{
    const m=new Map<string,typeof selectedItems>();
    selectedItems.forEach(i=>{ if(!m.has(i.store)) m.set(i.store,[]); m.get(i.store)!.push(i); });
    return Array.from(m.entries());
  },[selectedItems]);

  const courierOf=(store:string)=>courierByStore[store]||"reguler";
  const shippingBase=groups.reduce((s,[store])=>s+(couriers.find(c=>c.id===courierOf(store))?.price||0),0);

  const activeVoucher=vouchers.find(v=>v.code===voucher.toUpperCase());
  const hasFlashItem=selectedItems.some(i=>products.find((p:any)=>p.slug===i.slug)?.isFlashSale);
  const voucherValid = !!activeVoucher && selectedTotal>=(activeVoucher.minSpend||0) && (!(activeVoucher as any).flashOnly || hasFlashItem);
  const voucherDisc = voucherValid && activeVoucher?.type==="discount"
    ? Math.min(Math.round(selectedTotal*((activeVoucher as any).percent||0)/100), activeVoucher.maxDisc||0) : 0;
  const shipDisc = voucherValid && activeVoucher?.type==="shipping"
    ? Math.min(shippingBase, activeVoucher.maxDisc||0) : 0;
  const shipping=shippingBase-shipDisc;
  const voucherTotalDisc=voucherDisc+shipDisc;
  const grandTotal=selectedTotal + shipping + ADMIN_FEE - voucherDisc;

  if(!isLogged) return (
    <div className="max-w-[520px] mx-auto px-4 py-20 text-center">
      <div className="bg-white border border-neutral-200 p-8">
        <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto">🔒</div>
        <div className="text-[16px] font-bold mt-4">Masuk / Daftar untuk Belanja</div>
        <p className="text-[13px] text-neutral-500 mt-2 leading-relaxed">Seperti Shopee & Blibli — customer cukup daftar saat hendak membeli. Akunmu dipakai untuk alamat, lacak pesanan & voucher.</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link href="/login?next=/checkout" className="bg-black text-white py-3 text-[11px] tracking-widest uppercase font-bold text-center">Masuk</Link>
          <Link href="/register?next=/checkout" className="border border-black py-3 text-[11px] tracking-widest uppercase font-bold text-center">Daftar</Link>
        </div>
      </div>
    </div>
  );

  if(selectedItems.length===0) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <div className="text-[11px] tracking-widest uppercase font-bold">Checkout</div>
      <p className="text-[13px] text-neutral-500 mt-2">Tidak ada produk terpilih. Pilih produk di keranjang dulu.</p>
      <Link href="/cart" className="inline-block mt-6 bg-black text-white px-6 py-3 text-[11px] tracking-widest uppercase font-bold">Ke Keranjang</Link>
    </div>
  );

  const doOrder=async()=>{
    if(!address.trim()){ alert("Isi alamat pengiriman"); return; }
    setOrderErr(""); setPlacing(true);
    const courierLabel = groups.length===1
      ? courierOf(groups[0][0])
      : groups.map(([store])=>`${store}: ${courierOf(store)}`).join("; ");
    try{
      const orderNo=await placeOrder({
        items:selectedItems.map(i=>({slug:i.slug, qty:i.qty})),
        address, payment, courier:courierLabel, notes,
        shipping, voucher_discount:voucherTotalDisc, voucher_code:voucher.toUpperCase()||undefined,
      });
      router.push(`/orders?success=${orderNo}`);
    }catch(e:any){
      if(e?.status===422 && e?.data?.lacking){
        const ls=e.data.lacking.map((l:any)=>`"${l.store}" (fee ${formatPrice(l.fee)}, deposit ${formatPrice(l.balance)})`).join(", ");
        setOrderErr(`Pesanan belum bisa diproses: deposit toko ${ls} tidak cukup untuk biaya layanan 40%. Penjual sudah diberi notifikasi untuk top up saldo.`);
      }else{
        setOrderErr(e?.message || "Gagal membuat pesanan. Coba lagi.");
      }
      window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
    }finally{
      setPlacing(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="bg-white border-t-4 border-black">
          <div className="px-6 py-5">
            <h1 className="text-[18px] font-bold tracking-tight">Checkout</h1>
            <div className="w-full bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] mt-3 h-1.5"></div>
          </div>
        </div>

        {/* 1. ALAMAT */}
        <div className="mt-4 bg-white border border-neutral-200 p-5">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-bold"><span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px]">1</span> Alamat Pengiriman</div>
          {editAddr ? (
            <div className="mt-3">
              <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} className="w-full border border-black px-3 py-2 text-[13px] focus:outline-none" placeholder="Nama | HP | Alamat lengkap"/>
              <button onClick={()=>setEditAddr(false)} className="mt-2 bg-black text-white px-4 py-2 text-[11px] tracking-widest uppercase font-bold">Simpan Alamat</button>
            </div>
          ):(
            <div className="mt-3 flex gap-3">
              <div className="flex-1 text-[13px] leading-relaxed bg-[#fafafa] border border-dashed border-neutral-300 p-3">{address}</div>
              <button onClick={()=>setEditAddr(true)} className="shrink-0 border border-black px-4 py-2 text-[11px] tracking-widest uppercase font-bold h-fit">Ubah</button>
            </div>
          )}
        </div>

        {/* 2. PRODUK PER TOKO + PESAN + KURIR */}
        <div className="mt-4 bg-white border border-neutral-200">
          <div className="px-5 py-3 text-[11px] tracking-[0.14em] uppercase font-bold border-b border-neutral-200 bg-[#fafafa] flex items-center gap-2">
            <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px]">2</span> Produk & Pengiriman per Toko
          </div>
          <div className="grid grid-cols-12 px-5 py-3 text-[11px] tracking-widest uppercase font-bold text-neutral-500 border-b border-neutral-200">
            <div className="col-span-6">Produk</div>
            <div className="col-span-2 text-center hidden md:block">Harga</div>
            <div className="col-span-2 text-center">Jumlah</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>
          {groups.map(([store, list])=>{
            const storeSub=list.reduce((s,i)=>s+i.price*i.qty,0);
            return (
              <div key={store} className="border-b border-neutral-200 last:border-0">
                <div className="px-5 py-3 bg-[#fafafa] flex gap-2 items-center">
                  <span className="text-[11px] tracking-widest uppercase font-bold">{store}</span>
                  <span className="text-[10px] border border-black px-1.5 py-0.5">VERIFIED</span>
                </div>
                {list.map(i=>(
                  <div key={i.slug} className="grid grid-cols-12 px-5 py-4 items-center">
                    <div className="col-span-7 md:col-span-6 flex gap-3">
                      <img src={i.image} className="w-16 h-16 object-cover border border-neutral-200 bg-[#f5f5f5]" alt={i.title}/>
                      <div><div className="text-[13px] line-clamp-2 leading-snug">{i.title}</div><div className="text-[11px] text-neutral-500">Variasi: Default</div></div>
                    </div>
                    <div className="col-span-2 text-center hidden md:block text-[13px]">{formatPrice(i.price)}</div>
                    <div className="col-span-3 md:col-span-2 text-center text-[13px]">x{i.qty}</div>
                    <div className="col-span-2 text-right font-bold text-[13px]">{formatPrice(i.price*i.qty)}</div>
                  </div>
                ))}
                <div className="px-5 py-3 flex flex-col md:flex-row gap-3 border-t border-neutral-100 bg-white">
                  <div className="flex-1 flex gap-2 items-center">
                    <span className="text-[11px] tracking-wide shrink-0">Pesan ke penjual:</span>
                    <input value={notes[store]||""} onChange={e=>setNotes(n=>({...n,[store]:e.target.value}))} placeholder="cth: packing bubble wrap, titip salam..." className="flex-1 border border-neutral-300 px-3 py-2 text-[12px] focus:border-black outline-none"/>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[11px] tracking-wide shrink-0">Opsi Kurir:</span>
                    <select value={courierOf(store)} onChange={e=>setCourierByStore(m=>({...m,[store]:e.target.value}))} className="border border-neutral-300 px-3 py-2 text-[12px] bg-white focus:border-black outline-none">
                      {couriers.map(c=> <option key={c.id} value={c.id}>{c.name} {formatPrice(c.price)} ({c.eta})</option>)}
                    </select>
                  </div>
                </div>
                <div className="px-5 py-2 text-right text-[12px] text-neutral-500 bg-[#fafafa]">Subtotal {store}: <b className="text-black">{formatPrice(storeSub)}</b></div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            {/* 3. VOUCHER */}
            <div className="bg-white border border-neutral-200 p-5">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-bold"><span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px]">3</span> Voucher</div>
              <div className="mt-3 flex gap-2">
                <input value={voucher} onChange={e=>setVoucher(e.target.value)} placeholder="PANEN10 / GRATISONGKIR / FLASH20 / MALL5" className="flex-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none uppercase"/>
                {voucher && <span className={`text-[11px] px-3 py-2.5 font-bold ${voucherValid?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{voucherValid?`${activeVoucher?.code} Aktif`:"Invalid / min. belanja kurang"}</span>}
              </div>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {vouchers.map(v=>(
                  <button key={v.code} onClick={()=>setVoucher(v.code)} className={`text-left border p-2.5 hover:border-black ${voucher.toUpperCase()===v.code?"border-black bg-[#fafafa]":"border-neutral-200"}`}>
                    <div className="text-[11px] font-bold">{v.code} — {v.name}</div>
                    <div className="text-[10px] text-neutral-500">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. PEMBAYARAN */}
            <div className="bg-white border border-neutral-200 p-5">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-bold"><span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px]">4</span> Metode Pembayaran</div>
              <div className="mt-3 grid gap-2">
                {payments.map(p=>(
                  <label key={p.id} className={`flex gap-3 p-3 border cursor-pointer ${payment===p.id?"border-black bg-[#fafafa]":"border-neutral-200 hover:border-neutral-400"}`}>
                    <input type="radio" name="pay" checked={payment===p.id} onChange={()=>setPayment(p.id)} className="accent-black mt-1" />
                    <div className="flex-1"><div className="text-[13px] font-bold">{p.name}</div><div className="text-[11px] text-neutral-500">{p.desc}</div></div>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-neutral-500">Dengan checkout kamu menyetujui Syarat & Ketentuan INFINITY.</div>
            </div>
          </div>

          {/* 5. RINCIAN */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-neutral-200 p-5 sticky top-[88px]">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-bold"><span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px]">5</span> Rincian Pembayaran</div>
              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between"><span className="text-neutral-500">Subtotal Produk</span><span>{formatPrice(selectedTotal)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Ongkos Kirim</span><span>{formatPrice(shipping)}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Biaya Layanan</span><span>{formatPrice(ADMIN_FEE)}</span></div>
                {voucherTotalDisc>0 && <div className="flex justify-between text-emerald-600"><span>Voucher {activeVoucher?.code}</span><span>-{formatPrice(voucherTotalDisc)}</span></div>}
                <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-[15px]"><span>Total Pembayaran</span><span>{formatPrice(grandTotal)}</span></div>
              </div>
              <button onClick={doOrder} disabled={placing} className="w-full mt-5 bg-black text-white py-3.5 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-zinc-800 disabled:opacity-60">{placing?"Memproses...":`Buat Pesanan • ${formatPrice(grandTotal)}`}</button>
              {orderErr && <div className="mt-3 bg-red-50 border border-red-300 text-red-700 text-[12px] p-3 leading-relaxed">{orderErr}</div>}
              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500"><span>🔒</span> Pembayaran Aman 100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
