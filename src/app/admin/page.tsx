"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { apiAdmin, apiPatch, apiDelete, toOrder } from "@/lib/api";
import { formatPrice } from "@/lib/data";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage(){
  const {user, isLogged}=useAuth();
  const router=useRouter();
  const [tab,setTab]=useState("ringkas");
  const [overview,setOverview]=useState<any>(null);
  const [sellers,setSellers]=useState<any[]>([]);
  const [sellerFilter,setSellerFilter]=useState("");
  const [products,setProducts]=useState<any[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [users,setUsers]=useState<any[]>([]);
  const [msg,setMsg]=useState("");

  const load=useCallback(async()=>{
    try{
      const [ov, sl, pr, or, us]=await Promise.all([
        apiAdmin.overview(), apiAdmin.sellers(""), apiAdmin.products(), apiAdmin.orders(), apiAdmin.users(),
      ]);
      setOverview(ov);
      setSellers(ov ? (sl.data ?? sl) : []);
      setProducts((pr.data ?? pr).map((p:any)=>({
        id:p.id, title:p.title, slug:p.slug, price_min:Number(p.price_min),
        stock:p.stock, image:p.images?.[0]||"", store:p.store?.name||"-",
      })));
      setOrders((or.data ?? or).map(toOrder));
      setUsers(us.data ?? us);
    }catch(e:any){ setMsg(e?.message || "Gagal memuat data admin"); }
  },[]);

  useEffect(()=>{ if(isLogged && user?.role==="admin") load(); },[isLogged, user, load]);

  const reloadSellers=async(status:string)=>{
    setSellerFilter(status);
    try{
      const sl=await apiAdmin.sellers(status);
      setSellers(sl.data ?? sl);
    }catch(e:any){ setMsg(e?.message || "Gagal memuat penjual"); }
  };

  const setStatus=async(id:number, status:string)=>{
    if(!confirm(`${status==="approved"?"Setujui":"Tolak"} pendaftar ini?`)) return;
    try{
      await apiPatch(`/admin/sellers/${id}`,{status});
      reloadSellers(sellerFilter);
      const ov=await apiAdmin.overview(); setOverview(ov);
    }catch(e:any){ alert(e?.message || "Gagal"); }
  };

  const delProduct=async(id:number, title:string)=>{
    if(!confirm(`Hapus "${title}" dari database?`)) return;
    try{
      await apiDelete(`/admin/products/${id}`);
      setProducts(prev=>prev.filter(p=>p.id!==id));
      const ov=await apiAdmin.overview(); setOverview(ov);
    }catch(e:any){ alert(e?.message || "Gagal menghapus"); }
  };

  if(!isLogged || user?.role!=="admin") return (
    <div className="max-w-[480px] mx-auto px-4 py-16 text-center">
      <div className="w-14 h-14 bg-black text-white flex items-center justify-center mx-auto font-black">A</div>
      <div className="text-[16px] font-bold mt-4">Area Khusus Admin</div>
      <p className="text-[13px] text-neutral-500 mt-2">Masuk dengan akun admin untuk mengelola marketplace.</p>
      <div className="mt-4 bg-white border border-neutral-200 p-3 text-[12px]">admin@infinity.test / <b>password</b></div>
      <button onClick={()=>router.push("/login")} className="mt-4 bg-black text-white px-8 py-3 text-[11px] tracking-widest uppercase font-bold">Masuk Admin</button>
    </div>
  );

  const pending=sellers.filter(s=>s.status==="pending");
  const approved=sellers.filter(s=>s.status==="approved");

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="bg-black text-white p-6 flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-60">Infinity Admin Panel • Database</div>
            <h1 className="text-[20px] font-black">Halo, {user.name}</h1>
          </div>
          {pending.length>0 && <button onClick={()=>setTab("penjual")} className="ml-auto bg-amber-400 text-black px-4 py-2 text-[11px] tracking-widest uppercase font-bold">{pending.length} Pendaftar Menunggu →</button>}
        </div>

        <div className="mt-4 bg-white border border-neutral-200 flex gap-1 overflow-x-auto no-scrollbar">
          {[["ringkas","Ringkasan"],["penjual",`Penjual${pending.length?` (${pending.length})`:""}`],["produk","Produk"],["pesanan","Pesanan"],["pengguna","Pengguna"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} className={`whitespace-nowrap px-5 py-3 text-[11px] tracking-[0.12em] uppercase font-bold border-b-2 ${tab===v?"border-black":"border-transparent text-neutral-500"}`}>{l}</button>
          ))}
        </div>
        {msg && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-[12px] p-3">{msg}</div>}

        {tab==="ringkas" && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ["Produk (DB)", overview?.products ?? "-"],
              ["Toko (DB)", overview?.stores ?? "-"],
              ["Pesanan", overview?.orders ?? "-"],
              ["Omzet", overview ? formatPrice(overview.revenue).replace(",00","") : "-"],
              ["Penjual Aktif", overview?.sellers_approved ?? "-"],
              ["Menunggu", overview?.sellers_pending ?? "-"],
              ["Pengguna", overview?.users ?? "-"],
              ["Kategori", overview?.categories ?? "-"],
            ].map(([l,v])=>(
              <div key={l as string} className="bg-white border border-neutral-200 p-5">
                <div className="text-[22px] font-black truncate">{v as string}</div>
                <div className="text-[10px] tracking-widest uppercase text-neutral-500 mt-1">{l as string}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="penjual" && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              {[["","Semua"],["pending","Pending"],["approved","Aktif"],["rejected","Ditolak"]].map(([v,l])=>(
                <button key={v} onClick={()=>reloadSellers(v)} className={`px-4 py-2 text-[11px] tracking-widest uppercase font-bold border ${sellerFilter===v?"bg-black text-white border-black":"border-neutral-300 bg-white"}`}>{l}</button>
              ))}
            </div>
            {sellers.length===0 && <div className="bg-white border border-neutral-200 p-8 text-center text-[13px] text-neutral-500">Tidak ada pendaftar pada filter ini.</div>}
            {sellers.map(s=>(
              <div key={s.id} className="bg-white border border-neutral-200 p-5 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="font-bold text-[14px]">{s.store_name} <span className="font-normal text-neutral-400 text-[11px]">• {s.city}</span></div>
                  <div className="text-[12px] text-neutral-500 mt-0.5">{s.user?.name} • {s.user?.email} • Kategori: {s.main_category}</div>
                  <div className="text-[12px] text-neutral-600 mt-1">{s.description||"—"}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Daftar: {new Date(s.created_at).toLocaleString("id-ID")} • Deposit: <b className={Number(s.wallet_balance)<100000?"text-red-600":"text-emerald-600"}>{formatPrice(Number(s.wallet_balance)||0)}</b></div>
                </div>
                <div className="flex gap-2 shrink-0 h-fit items-center">
                  <span className={`text-[10px] font-bold px-2 py-1 ${s.status==="approved"?"bg-emerald-100 text-emerald-700":s.status==="rejected"?"bg-red-100 text-red-600":"bg-amber-100 text-amber-800"}`}>{s.status.toUpperCase()}</span>
                  {s.status==="pending" && (
                    <>
                      <button onClick={()=>setStatus(s.id,"approved")} className="bg-emerald-600 text-white px-4 py-2 text-[11px] tracking-widest uppercase font-bold">Setujui</button>
                      <button onClick={()=>setStatus(s.id,"rejected")} className="border border-red-600 text-red-600 px-4 py-2 text-[11px] tracking-widest uppercase font-bold">Tolak</button>
                    </>
                  )}
                  {s.status==="approved" && <button onClick={()=>setStatus(s.id,"rejected")} className="text-[11px] underline text-neutral-400 hover:text-red-600">Nonaktifkan</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="produk" && (
          <div className="mt-4 bg-white border border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-200 text-[11px] tracking-[0.14em] uppercase font-bold">Semua Produk di Database ({products.length})</div>
            {products.map(p=>(
              <div key={p.id} className="p-4 border-b border-neutral-100 flex gap-3 items-center">
                <img src={p.image} className="w-12 h-12 object-cover border border-neutral-200" alt={p.title}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-neutral-500">{p.store} • {formatPrice(p.price_min)} • Stok {p.stock}</div>
                </div>
                <button onClick={()=>delProduct(p.id, p.title)} className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-red-600 shrink-0">Hapus</button>
              </div>
            ))}
          </div>
        )}

        {tab==="pesanan" && (
          <div className="mt-4 bg-white border border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-200 text-[11px] tracking-[0.14em] uppercase font-bold">Semua Pesanan ({orders.length})</div>
            {orders.length===0 && <div className="p-6 text-[13px] text-neutral-500 text-center">Belum ada pesanan.</div>}
            {orders.map((o:any)=>(
              <div key={o.id} className="p-4 border-b border-neutral-100 text-[12px]">
                <div className="flex justify-between"><b>#{o.id}</b><span className="border px-2 py-0.5 text-[10px] uppercase font-bold">{o.status}</span></div>
                <div className="text-neutral-500 mt-1">{o.items.length} item • {formatPrice(o.total)} • {o.payment.toUpperCase()} • {new Date(o.date).toLocaleString("id-ID")}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="pengguna" && (
          <div className="mt-4 bg-white border border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-200 text-[11px] tracking-[0.14em] uppercase font-bold">Pengguna ({users.length})</div>
            {users.map((u:any)=>(
              <div key={u.id} className="p-4 border-b border-neutral-100 flex justify-between items-center gap-3 text-[13px]">
                <div><b>{u.name}</b> <span className="text-neutral-500">• {u.email}</span></div>
                <span className="text-[10px] uppercase font-bold border border-black px-2 py-0.5 shrink-0">{u.role}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/" className="text-[11px] tracking-widest uppercase underline underline-offset-4">← Kembali ke Marketplace</Link>
        </div>
      </div>
    </div>
  )
}
