"use client";
import React, {createContext, useContext, useState, useEffect, useCallback} from "react";
import { useAuth } from "./AuthContext";
import { apiPost, apiMyOrders, TOKEN_KEY } from "@/lib/api";

export type CartItem = { slug:string; title:string; price:number; qty:number; image:string; store:string; selected?:boolean };
export type Order = { id:string; items:CartItem[]; total:number; shipping:number; voucher:number; address:string; payment:string; courier:string; status:string; date:string; notes?:Record<string,string> };
export type NewOrder = {
  items:{slug:string; qty:number}[]; address:string; payment:string;
  courier?:string; notes?:Record<string,string>;
  shipping?:number; voucher_discount?:number; voucher_code?:string;
};
type Ctx = {
  items:CartItem[]; add:(i:CartItem)=>void; remove:(s:string)=>void; update:(s:string,q:number)=>void;
  toggle:(s:string)=>void; toggleStore:(store:string,v:boolean)=>void; toggleAll:(v:boolean)=>void;
  count:number; total:number; selectedTotal:number; selectedCount:number; selectedItems:CartItem[];
  clear:()=>void; removeSelected:()=>void;
  orders:Order[]; ordersLoading:boolean; refreshOrders:()=>Promise<void>;
  placeOrder:(o:NewOrder)=>Promise<string>;
};
const C = createContext<Ctx>({items:[], add:()=>{}, remove:()=>{}, update:()=>{}, toggle:()=>{}, toggleStore:()=>{}, toggleAll:()=>{}, count:0, total:0, selectedTotal:0, selectedCount:0, selectedItems:[], clear:()=>{}, removeSelected:()=>{}, orders:[], ordersLoading:false, refreshOrders:async()=>{}, placeOrder:async()=>""});

export default function CartProvider({children}:{children:React.ReactNode}){
  const {isLogged}=useAuth();
  const [items,setItems]=useState<CartItem[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [ordersLoading,setOrdersLoading]=useState(false);
  const [hydrated,setHydrated]=useState(false);

  const refreshOrders=useCallback(async()=>{
    if(!localStorage.getItem(TOKEN_KEY)){ setOrders([]); return; }
    setOrdersLoading(true);
    try{ setOrders(await apiMyOrders()); }catch{ /* biarkan data lama */ }
    finally{ setOrdersLoading(false); }
  },[]);

  useEffect(()=>{
    try{
      const s=localStorage.getItem("infinity_cart");
      if(s) setItems(JSON.parse(s));
      // bersihkan sisa riwayat lokal versi lama (kini dari database)
      localStorage.removeItem("infinity_orders");
    }catch{}
    setHydrated(true);
  },[]);
  useEffect(()=>{ if(hydrated) localStorage.setItem("infinity_cart", JSON.stringify(items)); },[items,hydrated]);
  useEffect(()=>{ if(isLogged) refreshOrders(); else setOrders([]); },[isLogged, refreshOrders]);

  const add=(i:CartItem)=>setItems(prev=>{
    const ex=prev.find(p=>p.slug===i.slug);
    if(ex) return prev.map(p=>p.slug===i.slug?{...p,qty:p.qty+i.qty, selected:true}:p);
    return [...prev,{...i,selected:true}];
  });
  const remove=(slug:string)=>setItems(prev=>prev.filter(p=>p.slug!==slug));
  const update=(slug:string, qty:number)=>setItems(prev=>prev.map(p=>p.slug===slug?{...p,qty:Math.max(1,qty)}:p));
  const toggle=(slug:string)=>setItems(prev=>prev.map(p=>p.slug===slug?{...p,selected:!p.selected}:p));
  const toggleStore=(store:string,v:boolean)=>setItems(prev=>prev.map(p=>p.store===store?{...p,selected:v}:p));
  const toggleAll=(v:boolean)=>setItems(prev=>prev.map(p=>({...p,selected:v})));
  const clear=()=>setItems([]);
  const removeSelected=()=>setItems(prev=>prev.filter(p=>!p.selected));

  // Buat pesanan di DATABASE (cek deposit 40% di server).
  // Berhasil → kembalikan order_no. Gagal (422 saldo kurang) → throw.
  const placeOrder=async(o:NewOrder)=>{
    const j=await apiPost<any>("/orders", o);
    setItems(prev=>prev.filter(p=>!p.selected));
    await refreshOrders();
    return j.order_no as string;
  };

  const count=items.reduce((s,i)=>s+i.qty,0);
  const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  const selectedItems=items.filter(i=>i.selected);
  const selectedTotal=selectedItems.reduce((s,i)=>s+i.price*i.qty,0);
  const selectedCount=selectedItems.reduce((s,i)=>s+i.qty,0);
  return <C.Provider value={{items,add,remove,update,toggle,toggleStore,toggleAll,count,total,selectedTotal,selectedCount,selectedItems,clear,removeSelected,orders,ordersLoading,refreshOrders,placeOrder}}>{children}</C.Provider>
}
export const useCart=()=>useContext(C);
