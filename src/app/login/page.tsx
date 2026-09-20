"use client";
import { useState } from "react";
import { useAuth, demoAccounts } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage(){
  const {user, login, logout, isLogged}=useAuth();
  const router=useRouter();
  const [email,setEmail]=useState("buyer@infinity.test");
  const [pass,setPass]=useState("password");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const doLogin=async()=>{
    setBusy(true);
    const ok=await login(email,pass);
    setBusy(false);
    if(!ok) setErr("Email atau password salah. Gunakan password: password");
    else { setErr(""); const nx=new URLSearchParams(window.location.search).get("next"); router.push(nx||"/"); }
  };
  if(isLogged) return (
    <div className="max-w-[480px] mx-auto px-4 py-10">
      <div className="bg-white border border-neutral-200 p-8 text-center">
        <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
        <div className="text-[16px] font-bold mt-4">Sudah Masuk</div>
        <div className="text-[13px] text-neutral-500 mt-1">{user?.name} • {user?.email} • {user?.role}</div>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={()=>router.push("/orders")} className="bg-black text-white px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Pesanan Saya</button>
          <button onClick={()=>{logout();}} className="border border-black px-6 py-2.5 text-[11px] tracking-widest uppercase font-bold">Keluar</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="bg-[#f5f5f5] min-h-[70vh] py-8">
      <div className="max-w-[420px] mx-auto px-4">
        <div className="bg-white border border-neutral-200 p-8">
          <div className="text-center">
            <div className="text-[20px] font-black tracking-[0.24em]">INFINITY</div>
            <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-neutral-500 mt-1">Masuk ke Akun</div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="buyer@infinity.test" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
            </div>
            <div>
              <label className="text-[11px] tracking-widest uppercase font-bold">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter" && doLogin()} placeholder="password" className="w-full mt-1 border border-neutral-300 px-3 py-2.5 text-[13px] focus:border-black outline-none" />
            </div>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] p-3">{err}</div>}
            <button onClick={doLogin} disabled={busy} className="w-full bg-black text-white py-3 text-[11px] tracking-[0.14em] uppercase font-bold hover:bg-zinc-800 disabled:opacity-60">{busy?"Memeriksa...":"Masuk"}</button>
            <div className="text-center text-[11px] text-neutral-500">Belum punya akun? <Link href="/register" className="underline font-bold text-black">Daftar</Link></div>
          </div>
        </div>
        <div className="mt-4 bg-white border border-neutral-200 p-4">
          <div className="text-[11px] tracking-[0.14em] uppercase font-bold">Akun Dummy — klik untuk isi</div>
          <div className="mt-2 grid gap-1">
            {demoAccounts.slice(0,4).map(a=>(
              <button key={a.email} onClick={()=>{setEmail(a.email); setPass("password");}} className="text-left text-[11px] border border-neutral-200 px-3 py-2 hover:border-black flex justify-between">
                <span>{a.email}</span><span className="font-bold uppercase">{a.role}</span>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-neutral-500 mt-2">Password semua: <b className="text-black">password</b> • supplier1..6 juga tersedia</div>
        </div>
      </div>
    </div>
  )
}
