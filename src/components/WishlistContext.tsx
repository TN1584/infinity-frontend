"use client";
import React, {createContext, useContext, useState, useEffect} from "react";

type Ctx = {
  wishlist:string[]; toggle:(slug:string)=>void; has:(slug:string)=>boolean;
  remove:(slug:string)=>void; clear:()=>void; count:number;
};
const C = createContext<Ctx>({wishlist:[], toggle:()=>{}, has:()=>false, remove:()=>{}, clear:()=>{}, count:0});

export default function WishlistProvider({children}:{children:React.ReactNode}){
  const [wishlist,setWishlist]=useState<string[]>([]);
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>{
    try{
      const s=localStorage.getItem("infinity_wishlist");
      if(s) setWishlist(JSON.parse(s));
    }catch{}
    setHydrated(true);
  },[]);
  useEffect(()=>{ if(hydrated) localStorage.setItem("infinity_wishlist", JSON.stringify(wishlist)); },[wishlist,hydrated]);
  const toggle=(slug:string)=>setWishlist(prev=> prev.includes(slug) ? prev.filter(s=>s!==slug) : [...prev, slug]);
  const has=(slug:string)=>wishlist.includes(slug);
  const remove=(slug:string)=>setWishlist(prev=>prev.filter(s=>s!==slug));
  const clear=()=>setWishlist([]);
  return <C.Provider value={{wishlist, toggle, has, remove, clear, count:wishlist.length}}>{children}</C.Provider>
}
export const useWishlist=()=>useContext(C);
