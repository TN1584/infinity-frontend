"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage(){
  const {register, isLogged, user}=useAuth();
  const router=useRouter();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [pass2,setPass2]=useState("");
  const [role,setRole]=useState("buyer");
  const [err,setErr]=useState("");
  const [ok,setOk]=useState(false);

  if(isLogged) return (
    <div className="max-w-[480px] mx-auto px-4 py-10">
      <div className="bg-white border border-neutral-200 p-8 text-center">
        <div className="text-[16px] font-bold">Sudah Masuk</div>
        <div className="text-[13px] text-neutral-500 mt-1">{user?.name} • {user?.email}</div>
        <button onClick={()=>router.push("/")} className="mt-6 bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Ke Beranda</button>
      </div>
    </div>
  );

  const doRegister=async()=>{
    if(!name.trim()){ setErr("Nama wajib diisi"); return; }
    if(pass!==pass2){ setErr("Konfirmasi password tidak cocok"); return; }
    const e=await register(name.trim(), email.trim(), pass, role);
    if(e){ setErr(e); return; }
    setOk(true);
    const nx=new URLSearchParams(window.location.search).get("next");
    setTimeout(()=>router.push(nx||"/"), 1200);
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[70vh] py-8">
      <div className="max-w-[440px] mx-auto px-4">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="text-center">
            <div className="text-[20px] font-black tracking-[0.24em]">INFINITY</div>
            <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-neutral-500 mt-1">Daftar Akun Baru</div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Nama Lengkap</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Budi Santoso" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="budi@email.com" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Peran</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] bg-white focus:border-black outline-none">
                <option value="buyer">Pembeli</option>
                <option value="petani">Petani (Komoditi)</option>
                <option value="preloved">Seller Preloved (Barang Bekas)</option>
                <option value="florist">Florist</option>
                <option value="supplier">Supplier Umum</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Password</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="min 6 karakter" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase font-bold">Konfirmasi</label>
                <input type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="ulang password" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
              </div>
            </div>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3">{err}</div>}
            {ok && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] p-3">Berhasil daftar! Mengalihkan...</div>}
            <button onClick={doRegister} className="w-full bg-black text-white py-3 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-zinc-800">Daftar Sekarang</button>
            <div className="text-center text-[11px] text-neutral-500">Sudah punya akun? <Link href="/login" className="underline font-bold text-black">Masuk</Link></div>
            <div className="text-[11px] text-neutral-400 text-center leading-relaxed">Dengan daftar kamu menyetujui Syarat & Ketentuan INFINITY. Gratis komisi 30 hari untuk petani, preloved & florist.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
