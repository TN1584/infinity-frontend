"use client";
import React, {createContext, useContext, useState, useEffect, useCallback} from "react";
import {
  fetchCategories, fetchProducts, fetchStores, fetchRfqs, fetchStats,
} from "@/lib/api";

type Catalog = {
  categories:any[]; products:any[]; stores:any[]; rfqs:any[];
  stats:any; loading:boolean; error:string; refresh:()=>void;
};

const C = createContext<Catalog>({
  categories:[], products:[], stores:[], rfqs:[], stats:null,
  loading:true, error:"", refresh:()=>{},
});

export default function CatalogProvider({children}:{children:React.ReactNode}){
  const [categories,setCategories]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [stores,setStores]=useState<any[]>([]);
  const [rfqs,setRfqs]=useState<any[]>([]);
  const [stats,setStats]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const load=useCallback(async()=>{
    setLoading(true); setError("");
    try{
      const [c,p,s,r,st]=await Promise.all([
        fetchCategories(), fetchProducts(), fetchStores(), fetchRfqs(), fetchStats(),
      ]);
      setCategories(c); setProducts(p); setStores(s); setRfqs(r); setStats(st);
    }catch(e:any){
      setError(e?.message || "Gagal memuat data dari database. Pastikan backend Laravel (port 8000) berjalan.");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{ load(); },[load]);

  return <C.Provider value={{categories, products, stores, rfqs, stats, loading, error, refresh:load}}>{children}</C.Provider>
}

export const useCatalog=()=>useContext(C);
