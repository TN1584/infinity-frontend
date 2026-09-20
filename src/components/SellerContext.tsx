"use client";
import React, {createContext, useContext, useState, useEffect, useMemo, useCallback} from "react";
import { useCatalog } from "./CatalogContext";
import { useAuth } from "./AuthContext";
import {
  apiPost, apiPut, apiPatch, apiDelete, apiGetAuth, TOKEN_KEY, toProduct,
} from "@/lib/api";

export type SellerStatus = "pending"|"approved"|"rejected";
export type SellerReg = {
  name:string; email:string; storeName:string; city:string;
  mainCategory:string; desc:string; status:SellerStatus; date:string;
};
export type WalletTx = { id:number|string; date:string; type:"topup"|"fee"; amount:number; desc:string; orderId?:number };
export type SellerNotif = { id:number|string; date:string; read:boolean; title:string; body:string; orderRef?:string };

export const SERVICE_FEE_RATE = 0.4;
export const MIN_DEPOSIT = 100000;

const normReg = (r:any, email:string, name:string): SellerReg => ({
  name, email,
  storeName: r.store_name, city: r.city || "",
  mainCategory: r.main_category || "", desc: r.description || "",
  status: r.status, date: r.created_at,
});

type Ctx = {
  statusReg:SellerReg|null; storeInfo:{name:string;slug:string;city:string}|null;
  loadStatus:()=>Promise<void>;
  registerSeller:(r:{name?:string; email?:string; pass?:string; storeName:string; city:string; mainCategory:string; desc:string})=>Promise<string|null>;
  mySeller:(email:string|undefined)=>SellerReg|undefined;
  sellers:any[]; loadSellers:(status?:string)=>Promise<void>;
  approveSeller:(id:number)=>Promise<void>;
  rejectSeller:(id:number)=>Promise<void>;
  sellerProducts:any[]; loadProducts:()=>Promise<void>;
  addProduct:(p:{title:string; category:string; price:number; normalPrice?:number; stock:number; unit:string; condition?:string; image?:string})=>Promise<string|null>;
  updateProduct:(id:number, patch:any)=>Promise<string|null>;
  deleteProduct:(id:number)=>Promise<string|null>;
  wallet:{balance:number; txs:WalletTx[]};
  loadWallet:()=>Promise<void>;
  topUp:(amount:number)=>Promise<string|null>;
  notifs:SellerNotif[]; unread:number;
  loadNotifs:()=>Promise<void>;
  markNotifRead:(id:number|string)=>Promise<void>;
  sellerOrders:any[]; loadSellerOrders:()=>Promise<void>;
  allProducts:any[];
};

const C = createContext<Ctx>({
  statusReg:null, storeInfo:null, loadStatus:async()=>{},
  registerSeller:async()=>"Fitur belum siap",
  mySeller:()=>undefined,
  sellers:[], loadSellers:async()=>{},
  approveSeller:async()=>{}, rejectSeller:async()=>{},
  sellerProducts:[], loadProducts:async()=>{},
  addProduct:async()=>"Fitur belum siap",
  updateProduct:async()=>"Fitur belum siap",
  deleteProduct:async()=>"Fitur belum siap",
  wallet:{balance:0, txs:[]}, loadWallet:async()=>{},
  topUp:async()=>"Fitur belum siap",
  notifs:[], unread:0, loadNotifs:async()=>{}, markNotifRead:async()=>{},
  sellerOrders:[], loadSellerOrders:async()=>{},
  allProducts:[],
});

const withStore = (p:any, store:{name:string;city:string}) => ({
  ...toProduct(p),
  dbId: p.id,
  store:{name: store?.name || p.store?.name || "-", city: store?.city || p.store?.city || "", badge: String(p.store?.badge || "verified").toLowerCase()},
});

export default function SellerProvider({children}:{children:React.ReactNode}){
  const {user, isLogged, sync}=useAuth();
  const {products:dbProducts}=useCatalog();
  const [statusReg,setStatusReg]=useState<SellerReg|null>(null);
  const [storeInfo,setStoreInfo]=useState<{name:string;slug:string;city:string}|null>(null);
  const [sellers,setSellers]=useState<any[]>([]);
  const [sellerProducts,setSellerProducts]=useState<any[]>([]);
  const [wallet,setWallet]=useState<{balance:number; txs:WalletTx[]}>({balance:0, txs:[]});
  const [notifs,setNotifs]=useState<SellerNotif[]>([]);
  const [unread,setUnread]=useState(0);
  const [sellerOrders,setSellerOrders]=useState<any[]>([]);

  const loadStatus=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)){ setStatusReg(null); setStoreInfo(null); return; }
    try{
      const j=await apiGetAuth<any>("/seller/status");
      if(j.registration){
        const me = await apiGetAuth<{name:string;email:string;role:string}>("/user").catch(()=>null);
        setStatusReg(normReg(j.registration, me?.email||"", me?.name||""));
      } else setStatusReg(null);
      setStoreInfo(j.store || null);
    }catch{ setStatusReg(null); setStoreInfo(null); }
  },[]);

  const loadProducts=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)){ setSellerProducts([]); return; }
    try{
      const list:any[]=await apiGetAuth("/seller/products");
      setSellerProducts(list.map((p:any)=>withStore(p, {name: p.store?.name||"", city: p.store?.city||""})));
    }catch{ setSellerProducts([]); }
  },[]);

  const loadWallet=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)) return;
    try{
      const w=await apiGetAuth<any>("/seller/wallet");
      setWallet({
        balance: Number(w.balance)||0,
        txs: (w.transactions||[]).map((t:any)=>({id:t.id, date:t.created_at, type:t.type, amount:Number(t.amount), desc:t.description||"", orderId:t.order_id})),
      });
    }catch{}
  },[]);

  const loadNotifs=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)){ setNotifs([]); setUnread(0); return; }
    try{
      const j=await apiGetAuth<any>("/notifications");
      setUnread(j.unread||0);
      setNotifs(((j.data?.data ?? j.data) || []).map((n:any)=>({id:n.id, date:n.created_at, read:!!n.read, title:n.title, body:n.body, orderRef:n.order_ref})));
    }catch{}
  },[]);

  const loadSellerOrders=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)){ setSellerOrders([]); return; }
    try{
      const { apiSellerOrders } = await import("@/lib/api");
      setSellerOrders(await apiSellerOrders());
    }catch{ setSellerOrders([]); }
  },[]);

  useEffect(()=>{
    if(isLogged){ loadStatus(); loadProducts(); loadWallet(); loadNotifs(); }
    else { setStatusReg(null); setStoreInfo(null); setSellerProducts([]); setNotifs([]); setUnread(0); setSellerOrders([]); setWallet({balance:0, txs:[]}); }
  },[isLogged, loadStatus, loadProducts, loadWallet, loadNotifs]);

  const registerSeller=async(r:{name?:string; email?:string; pass?:string; storeName:string; city:string; mainCategory:string; desc:string})=>{
    if(!r.storeName.trim()) return "Nama toko wajib diisi";
    if(!r.city.trim()) return "Kota wajib diisi";
    try{
      const j=await apiPost<any>("/seller/register",{
        ...(isLogged ? {} : {name:r.name, email:r.email, password:r.pass}),
        store_name:r.storeName.trim(), city:r.city.trim(),
        main_category:r.mainCategory, description:r.desc.trim(),
      });
      if(j.token){
        localStorage.setItem(TOKEN_KEY, j.token);
        await sync();
      }
      await loadStatus();
      return null;
    }catch(e:any){
      return e?.data?.errors ? Object.values(e.data.errors).flat().join(" ") : (e?.message || "Gagal mendaftar");
    }
  };

  const mySeller=(email:string|undefined)=>{
    if(!email || !statusReg) return undefined;
    if(statusReg.email && statusReg.email.toLowerCase()!==email.toLowerCase()) return undefined;
    return statusReg;
  };

  const loadSellers=async(status="")=>{
    const j=await apiGetAuth<any>(`/admin/sellers${status?`?status=${status}`:""}`);
    setSellers(j.data || j);
  };
  const approveSeller=async(id:number)=>{ await apiPatch(`/admin/sellers/${id}`,{status:"approved"}); await loadSellers(); };
  const rejectSeller=async(id:number)=>{ await apiPatch(`/admin/sellers/${id}`,{status:"rejected"}); await loadSellers(); };

  const addProduct=async(p:{title:string; category:string; price:number; normalPrice?:number; stock:number; unit:string; condition?:string; image?:string})=>{
    if(p.title.trim().length<10) return "Judul produk minimal 10 karakter";
    if(!p.price || p.price<1000) return "Harga jual wajib diisi (min. Rp1.000)";
    try{
      const created=await apiPost<any>("/seller/products",{
        title:p.title.trim(), category:p.category, price:p.price,
        normal_price:p.normalPrice, stock:p.stock, unit:p.unit,
        condition:p.condition, image:p.image || undefined,
      });
      setSellerProducts(prev=>[withStore(created, {name: created.store?.name||storeInfo?.name||"", city: storeInfo?.city||""}), ...prev]);
      return null;
    }catch(e:any){
      return e?.data?.errors ? Object.values(e.data.errors).flat().join(" ") : (e?.message || "Gagal menambah produk");
    }
  };

  const updateProduct=async(id:number, patch:any)=>{
    try{
      const updated=await apiPut<any>(`/seller/products/${id}`, patch);
      setSellerProducts(prev=>prev.map(x=>x.dbId===id?withStore(updated,{name:updated.store?.name||"",city:updated.store?.city||""}):x));
      return null;
    }catch(e:any){ return e?.message || "Gagal menyimpan"; }
  };

  const deleteProduct=async(id:number)=>{
    try{ await apiDelete(`/seller/products/${id}`); setSellerProducts(prev=>prev.filter(x=>x.dbId!==id)); return null; }
    catch(e:any){ return e?.message || "Gagal menghapus"; }
  };

  const topUp=async(amount:number)=>{
    try{
      const w=await apiPost<any>("/seller/topup",{amount});
      await loadWallet();
      return null;
    }catch(e:any){ return e?.message || "Gagal top up"; }
  };

  const markNotifRead=async(id:number|string)=>{
    try{ await apiPatch(`/notifications/${id}/read`); }catch{}
    setNotifs(prev=>prev.map(n=>String(n.id)===String(id)?{...n,read:true}:n));
    setUnread(u=>Math.max(0,u-1));
  };

  const allProducts=useMemo(()=>{
    const mine=new Set(sellerProducts.map(p=>p.slug));
    return [...sellerProducts, ...dbProducts.filter(p=>!mine.has(p.slug))];
  },[sellerProducts,dbProducts]);

  return <C.Provider value={{statusReg, storeInfo, loadStatus, registerSeller, mySeller, sellers, loadSellers, approveSeller, rejectSeller, sellerProducts, loadProducts, addProduct, updateProduct, deleteProduct, wallet, loadWallet, topUp, notifs, unread, loadNotifs, markNotifRead, sellerOrders, loadSellerOrders, allProducts}}>{children}</C.Provider>
}
export const useSeller=()=>useContext(C);
export const useAllProducts=()=>useSeller().allProducts;
