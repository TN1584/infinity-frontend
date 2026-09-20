"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { useSeller } from "@/components/SellerContext";
import { useCatalog } from "@/components/CatalogContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerRegisterPage(){
  const {user, isLogged}=useAuth();
  const {registerSeller, mySeller}=useSeller();
  const {categories}=useCatalog();
  const router=useRouter();
  const [name,setName]=useState(user?.name||"");
  const [email,setEmail]=useState(user?.email||"");
  const [pass,setPass]=useState("");
  const [storeName,setStoreName]=useState("");
  const [city,setCity]=useState("");
  const [mainCategory,setMainCategory]=useState("");
  const [desc,setDesc]=useState("");
  const [agree,setAgree]=useState(false);
  const [err,setErr]=useState("");
  const [done,setDone]=useState(false);
  useEffect(()=>{ if(!mainCategory && categories.length>0) setMainCategory(categories[0].slug); },[categories, mainCategory]);

  const existing = isLogged ? mySeller(user?.email) : mySeller(email);

  const submit=async()=>{
    if(!agree){ setErr("Centang persetujuan Syarat & Ketentuan seller"); return; }
    const e=await registerSeller({name, email, pass, storeName, city, mainCategory, desc});
    if(e){ setErr(e); return; }
    setErr(""); setDone(true);
  };

  if(done || existing) {
    const s = existing || {storeName, status:"pending" as const};
    return (
      <div className="max-w-[560px] mx-auto px-4 py-10">
        <div className="bg-white border border-neutral-200 p-8 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto text-xl ${s.status==="approved"?"bg-emerald-600 text-white":s.status==="rejected"?"bg-red-600 text-white":"bg-amber-400 text-black"}`}>
            {s.status==="approved"?"✓":s.status==="rejected"?"✕":"◷"}
          </div>
          <div className="text-[16px] font-bold mt-4">
            {s.status==="approved"?"Toko Disetujui!":s.status==="rejected"?"Pendaftaran Ditolak":"Pendaftaran Diterima!"}
          </div>
          <div className="text-[13px] text-neutral-500 mt-2 leading-relaxed">
            {s.status==="approved"
              ? `Toko "${s.storeName}" sudah aktif. Kamu bisa mulai pasarkan produk.`
              : s.status==="rejected"
              ? `Pendaftaran toko "${s.storeName}" ditolak admin. Hubungi support@infinity.co.id untuk banding.`
              : `Toko "${s.storeName}" menunggu verifikasi admin (maks. 1x24 jam). Kamu akan bisa jualan setelah disetujui.`}
          </div>
          <div className="mt-6 flex gap-2 justify-center">
            {s.status==="approved"
              ? <button onClick={()=>router.push("/seller")} className="bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Buka Dashboard Seller</button>
              : <button onClick={()=>router.push("/")} className="bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Ke Beranda</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen py-8">
      <div className="max-w-[560px] mx-auto px-4">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-neutral-500">Seller Centre</div>
          <h1 className="text-[22px] font-black tracking-tight mt-1">Daftar Jadi Penjual</h1>
          <p className="text-[13px] text-neutral-500 mt-1">Isi data akun + toko. Admin akan verifikasi sebelum tokomu aktif — seperti Shopee/Tokopedia.</p>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Nama Lengkap</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="toko@email.com" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
            </div>
            {!isLogged && (
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Password Akun</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="min 6 karakter" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Nama Toko</label>
                <input value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="Toko Berkah Jaya" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Kota</label>
                <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Jakarta" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
              </div>
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Kategori Utama Dagangan</label>
              <select value={mainCategory} onChange={e=>setMainCategory(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] bg-white focus:border-black outline-none">
                {categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Deskripsi Toko</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Ceritakan daganganmu..." className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none"/>
            </div>
            <label className="flex gap-2 text-[12px] text-neutral-600 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="accent-black mt-1"/>
              Saya menyetujui Syarat & Ketentuan Seller: barang original/legal, respon chat maks. 1x24 jam, dan siap kena penalti jika melanggar.
            </label>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3">{err}</div>}
            <button onClick={submit} className="w-full bg-black text-white py-3 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-zinc-800">Kirim Pendaftaran</button>
            <div className="text-center text-[11px] text-neutral-500">Sudah daftar? <Link href="/login" className="underline font-bold text-black">Masuk</Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}
