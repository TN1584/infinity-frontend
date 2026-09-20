"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSeller } from "@/components/SellerContext";
import { useCatalog } from "@/components/CatalogContext";
import { formatPrice } from "@/lib/data";
import { SERVICE_FEE_RATE, MIN_DEPOSIT } from "@/components/SellerContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UNITS=["pcs","kg","unit","paket","pot","pack","botol","karung","pasang","set","buket","papan"];

export default function SellerDashboard(){
  const {user, isLogged}=useAuth();
  const {mySeller, statusReg, storeInfo, sellerProducts, addProduct, updateProduct, deleteProduct,
    wallet, topUp, notifs, unread, markNotifRead, sellerOrders, loadSellerOrders}=useSeller();
  const router=useRouter();
  const [tab,setTab]=useState("produk");
  const [editing,setEditing]=useState<number|null>(null);

  // form tambah/edit
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState("");
  const {categories}=useCatalog();
  useEffect(()=>{ if(!category && categories.length>0) setCategory(categories[0].slug); },[categories, category]);
  const [price,setPrice]=useState("");
  const [normalPrice,setNormalPrice]=useState("");
  const [stock,setStock]=useState("100");
  const [unit,setUnit]=useState("pcs");
  const [condition,setCondition]=useState("Baru");
  const [freeShip,setFreeShip]=useState(true);
  const [image,setImage]=useState("");
  const [msg,setMsg]=useState("");
  const [topupAmt,setTopupAmt]=useState("100000");
  const [topupMsg,setTopupMsg]=useState("");

  const reg = mySeller(user?.email);
  const isSellerRole = user && ["seller","supplier","petani","preloved","florist"].includes(user.role);

  useEffect(()=>{ if(tab==="pesanan") loadSellerOrders(); },[tab]);

  if(!isLogged) return (
    <div className="max-w-[480px] mx-auto px-4 py-16 text-center">
      <div className="text-[11px] tracking-widest uppercase font-bold">Seller Centre</div>
      <p className="text-[13px] text-neutral-500 mt-2">Masuk dulu untuk mengelola tokomu.</p>
      <button onClick={()=>router.push("/login")} className="mt-5 bg-black text-white px-8 py-3 text-[11px] tracking-widest uppercase font-bold">Masuk</button>
    </div>
  );
  if(!isSellerRole || !reg) return (
    <div className="max-w-[480px] mx-auto px-4 py-16 text-center">
      <div className="text-[11px] tracking-widest uppercase font-bold">Seller Centre</div>
      <p className="text-[13px] text-neutral-500 mt-2">Akunmu ({user?.role}) belum terdaftar sebagai penjual. Daftar dulu sebelum pasarkan produk.</p>
      <button onClick={()=>router.push("/seller/register")} className="mt-5 bg-black text-white px-8 py-3 text-[11px] tracking-widest uppercase font-bold">Daftar Jadi Seller</button>
    </div>
  );
  if(reg.status!=="approved") return (
    <div className="max-w-[480px] mx-auto px-4 py-16 text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl ${reg.status==="rejected"?"bg-red-600 text-white":"bg-amber-400"}`}>{reg.status==="rejected"?"✕":"◷"}</div>
      <div className="text-[16px] font-bold mt-4">{reg.status==="rejected"?"Pendaftaran Ditolak":"Menunggu Verifikasi Admin"}</div>
      <p className="text-[13px] text-neutral-500 mt-2">{reg.status==="rejected"?"Hubungi support@infinity.co.id untuk banding.":`Toko "${reg.storeName}" sedang diperiksa admin (maks. 1x24 jam).`}</p>
      <button onClick={()=>router.push("/")} className="mt-5 border border-black px-8 py-3 text-[11px] tracking-widest uppercase font-bold">Ke Beranda</button>
    </div>
  );

  const mine=sellerProducts;
  const myOrders=sellerOrders;
  const revenue=myOrders.reduce((s:number,o:any)=>s+o.total,0);

  const resetForm=()=>{
    setTitle(""); if(categories.length>0) setCategory(categories[0].slug); setPrice(""); setNormalPrice("");
    setStock("100"); setUnit("pcs"); setCondition("Baru"); setFreeShip(true); setImage(""); setEditing(null);
  };
  const startEdit=(id:number)=>{
    const p=mine.find((x:any)=>x.dbId===id); if(!p) return;
    setEditing(id); setTitle(p.title); setCategory(p.category);
    setPrice(String(p.price_min)); setNormalPrice(p.price_max>p.price_min?String(p.price_max):"");
    setStock(String(p.stock)); setUnit(p.unit);
    setFreeShip(true); setImage(p.images[0]?.includes("picsum")?"":p.images[0]);
    setTab("tambah"); setMsg("");
  };
  const submit=async()=>{
    const pr=Number(price);
    if(title.trim().length<10){ setMsg("Judul produk minimal 10 karakter"); return; }
    if(!pr || pr<1000){ setMsg("Harga jual wajib diisi (min. Rp1.000)"); return; }
    if(Number(stock)<0){ setMsg("Stok tidak valid"); return; }
    if(editing){
      const e=await updateProduct(editing,{title:title.trim(), category, price:pr, normal_price:normalPrice&&Number(normalPrice)>pr?Number(normalPrice):undefined, stock:Number(stock), unit, image:image.trim()||undefined});
      setMsg(e || "Perubahan tersimpan!");
      if(!e){ resetForm(); setTab("produk"); }
    }else{
      const e=await addProduct({title:title.trim(), category, price:pr, normalPrice:normalPrice?Number(normalPrice):undefined, stock:Number(stock), unit, condition, image:image.trim()||undefined});
      setMsg(e || "Produk terbit & langsung tampil di katalog!");
      if(!e) resetForm();
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="bg-black text-white p-6 flex flex-wrap gap-4 items-center">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-60">Seller Centre</div>
            <h1 className="text-[20px] font-black">{reg.storeName}</h1>
            <div className="text-[12px] opacity-70">{reg.city} • {user?.email} • VERIFIED</div>
          </div>
          <div className="ml-auto flex gap-6 text-center">
            <div><div className="text-[20px] font-black">{mine.length}</div><div className="text-[10px] tracking-widest uppercase opacity-60">Produk</div></div>
            <div><div className="text-[20px] font-black">{myOrders.length}</div><div className="text-[10px] tracking-widest uppercase opacity-60">Pesanan</div></div>
            <div><div className="text-[20px] font-black">{formatPrice(revenue).replace(",00","")}</div><div className="text-[10px] tracking-widest uppercase opacity-60">Omzet</div></div>
          </div>
        </div>

        <div className="mt-4 bg-white border border-neutral-200 flex gap-1 overflow-x-auto no-scrollbar">
          {[["produk","Produk Saya"],["tambah",editing?"Edit Produk":"Tambah Produk"],["pesanan","Pesanan Masuk"],["saldo",`Saldo${unread?` (${unread})`:""}`],["toko","Profil Toko"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setTab(v); setMsg("");}} className={`whitespace-nowrap px-5 py-3 text-[11px] tracking-[0.12em] uppercase font-bold border-b-2 ${tab===v?"border-black":"border-transparent text-neutral-500"}`}>{l}</button>
          ))}
        </div>

        {tab==="produk" && (
          <div className="mt-4 bg-white border border-neutral-200">
            {mine.length===0 ? (
              <div className="p-10 text-center">
                <div className="text-[13px] font-bold">Belum ada produk</div>
                <p className="text-[12px] text-neutral-500 mt-1">Tambahkan produk pertamamu sesuai kategori.</p>
                <button onClick={()=>setTab("tambah")} className="mt-4 bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">+ Tambah Produk</button>
              </div>
            ):(
              <div className="divide-y divide-neutral-100">
                {mine.map((p:any)=>(
                  <div key={p.dbId} className="p-4 flex gap-4 items-center">
                    <Link href={`/products/${p.slug}`}><img src={p.images[0]} className="w-16 h-16 object-cover border border-neutral-200" alt={p.title}/></Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${p.slug}`} className="text-[13px] font-medium line-clamp-1 hover:underline">{p.title}</Link>
                      <div className="text-[11px] text-neutral-500">{categories.find((c:any)=>c.slug===p.category)?.name} • Stok {p.stock} • Terjual {p.sold}</div>
                      <div className="text-[13px] font-bold mt-0.5">{formatPrice(p.price_min)}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>startEdit(p.dbId)} className="border border-black px-3 py-1.5 text-[11px] tracking-widest uppercase font-bold">Edit</button>
                      <button onClick={async()=>{if(confirm(`Hapus "${p.title}"?`)){ const e=await deleteProduct(p.dbId); if(e) alert(e); }}} className="border border-neutral-300 px-3 py-1.5 text-[11px] tracking-widest uppercase hover:text-red-600 hover:border-red-600">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="tambah" && (
          <div className="mt-4 bg-white border border-neutral-200 p-6">
            <h2 className="text-[13px] tracking-[0.14em] uppercase font-bold">{editing?"Edit Produk":"Tambah Produk Baru"}</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[11px] tracking-widest uppercase font-bold">Judul Produk (min. 10 karakter)</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="cth: Kaos Polos Cotton Combed Premium" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Kategori *</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] bg-white focus:border-black outline-none">
                  {categories.map((c:any)=><option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Satuan</label>
                <select value={unit} onChange={e=>setUnit(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] bg-white focus:border-black outline-none">
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Harga Jual (Rp) *</label>
                <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="49000" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Harga Coret (opsional)</label>
                <input type="number" value={normalPrice} onChange={e=>setNormalPrice(e.target.value)} placeholder="79000" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Stok</label>
                <input type="number" value={stock} onChange={e=>setStock(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Kondisi</label>
                <select value={condition} onChange={e=>setCondition(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] bg-white focus:border-black outline-none">
                  <option>Baru</option><option>Bekas</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] tracking-widest uppercase font-bold">Foto (URL, kosongkan = otomatis)</label>
                <input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <label className="flex gap-2 text-[13px] cursor-pointer"><input type="checkbox" checked={freeShip} onChange={e=>setFreeShip(e.target.checked)} className="accent-black"/> Gratis Ongkir</label>
            </div>
            {msg && <div className={`mt-4 text-[12px] p-3 border ${msg.includes("terbit")||msg.includes("tersimpan")?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-red-50 border-red-200 text-red-700"}`}>{msg}</div>}
            <div className="mt-4 flex gap-2">
              <button onClick={submit} className="bg-black text-white px-8 py-3 text-[11px] tracking-widest uppercase font-bold">{editing?"Simpan Perubahan":"Terbitkan Produk"}</button>
              {editing && <button onClick={()=>{resetForm(); setMsg(""); setTab("produk");}} className="border border-neutral-300 px-6 py-3 text-[11px] tracking-widest uppercase">Batal</button>}
            </div>
          </div>
        )}

        {tab==="pesanan" && (
          <div className="mt-4 bg-white border border-neutral-200">
            {myOrders.length===0 ? (
              <div className="p-10 text-center text-[13px] text-neutral-500">Belum ada pesanan untuk tokomu.</div>
            ):(
              <div className="divide-y divide-neutral-100">
                {myOrders.map((o:any)=>(
                  <div key={o.id} className="p-4">
                    <div className="flex justify-between text-[11px]"><span className="font-bold tracking-widest">#{o.id} • {new Date(o.date).toLocaleDateString("id-ID")}</span><span className="border px-2 py-0.5 uppercase font-bold">{o.status}</span></div>
                    <div className="mt-2 space-y-1 text-[12px] text-neutral-600">
                      {o.items.map((it:any)=><div key={it.slug}>• {it.title} — x{it.qty} ({formatPrice(it.price*it.qty)})</div>)}
                    </div>
                    <div className="mt-2 text-[12px]">Total: <b>{formatPrice(o.total)}</b> • {o.payment.toUpperCase()} • {o.courier}</div>
                    <div className="text-[11px] text-neutral-500 mt-1">{o.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="saldo" && (
          <div className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black text-white p-6">
                <div className="text-[11px] tracking-[0.18em] uppercase opacity-60">Deposit Seller</div>
                <div className="text-[28px] font-black mt-1">{formatPrice(wallet.balance)}</div>
                <div className="text-[11px] opacity-70 mt-2 leading-relaxed">
                  Biaya layanan {Math.round(SERVICE_FEE_RATE*100)}% dari tiap produk terjual otomatis terpotong dari deposit ini.
                  Minimal deposit {formatPrice(MIN_DEPOSIT)}. Pesanan DITAHAN bila saldo tidak cukup.
                </div>
                {wallet.balance<MIN_DEPOSIT && <div className="mt-2 bg-amber-400 text-black text-[11px] font-bold p-2">Saldo di bawah minimum — segera top up!</div>}
              </div>
              <div className="bg-white border border-neutral-200 p-6">
                <div className="text-[11px] tracking-[0.14em] uppercase font-bold">Top Up Deposit (min. {formatPrice(MIN_DEPOSIT)})</div>
                <div className="mt-3 flex gap-2">
                  {[100000,200000,500000,1000000].map(n=>(
                    <button key={n} onClick={()=>setTopupAmt(String(n))} className={`flex-1 border py-2 text-[11px] font-bold ${topupAmt===String(n)?"border-black bg-black text-white":"border-neutral-300"}`}>{n/1000}rb</button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input type="number" value={topupAmt} onChange={e=>setTopupAmt(e.target.value)} className="flex-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
                  <button onClick={async()=>{const e=await topUp(Number(topupAmt)); setTopupMsg(e||`Top up ${formatPrice(Number(topupAmt))} berhasil!`);}} className="bg-black text-white px-6 text-[11px] tracking-widest uppercase font-bold">Top Up</button>
                </div>
                {topupMsg && <div className={`mt-3 text-[12px] p-3 border ${topupMsg.includes("berhasil")?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-red-50 border-red-200 text-red-700"}`}>{topupMsg}</div>}
              </div>
            </div>

            <div className="bg-white border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-200 text-[11px] tracking-[0.14em] uppercase font-bold">Notifikasi ({notifs.length})</div>
              {notifs.length===0 && <div className="p-6 text-[13px] text-neutral-500 text-center">Belum ada notifikasi.</div>}
              {notifs.map(n=>(
                <div key={n.id} className={`p-4 border-b border-neutral-100 last:border-0 flex gap-3 ${n.read?"":"bg-amber-50"}`}>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold">{n.title}</div>
                    <div className="text-[12px] text-neutral-600 mt-0.5 leading-relaxed">{n.body}</div>
                    <div className="text-[11px] text-neutral-400 mt-1">{new Date(n.date).toLocaleString("id-ID")}</div>
                  </div>
                  {!n.read && <button onClick={()=>markNotifRead(n.id)} className="shrink-0 h-fit border border-black px-3 py-1.5 text-[10px] tracking-widest uppercase font-bold">Tandai Dibaca</button>}
                </div>
              ))}
            </div>

            <div className="bg-white border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-200 text-[11px] tracking-[0.14em] uppercase font-bold">Riwayat Transaksi ({wallet.txs.length})</div>
              {wallet.txs.length===0 && <div className="p-6 text-[13px] text-neutral-500 text-center">Belum ada transaksi.</div>}
              {wallet.txs.map(t=>(
                <div key={t.id} className="p-4 border-b border-neutral-100 last:border-0 flex justify-between items-center gap-3 text-[13px]">
                  <div>
                    <div className="font-bold">{t.type==="topup"?"Top Up Deposit":"Biaya Layanan 40%"}</div>
                    <div className="text-[11px] text-neutral-500">{t.desc} • {new Date(t.date).toLocaleString("id-ID")}</div>
                  </div>
                  <div className={`font-bold shrink-0 ${t.type==="topup"?"text-emerald-600":"text-red-600"}`}>{t.type==="topup"?"+":"-"}{formatPrice(t.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="toko" && (
          <div className="mt-4 bg-white border border-neutral-200 p-6 text-[13px] space-y-2">
            <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-500">Nama Toko</span><b>{reg.storeName}</b></div>
            <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-500">Kota</span><b>{reg.city}</b></div>
            <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-500">Kategori Utama</span><b>{categories.find((c:any)=>c.slug===reg.mainCategory)?.name}</b></div>
            <div className="flex justify-between border-b border-neutral-100 pb-2"><span className="text-neutral-500">Status</span><b className="text-emerald-600">APPROVED • Aktif</b></div>
            <p className="text-neutral-500 text-[12px] pt-2">{reg.desc||"Belum ada deskripsi."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
