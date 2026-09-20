"use client";
import React, {createContext, useContext, useState, useEffect} from "react";
import { apiPost, apiGetAuth, TOKEN_KEY } from "@/lib/api";

type User={email:string; name:string; role:string};
const baseUsers:User[]=[
  {email:"admin@infinity.test", name:"Admin Infinity", role:"admin"},
  {email:"buyer@infinity.test", name:"Buyer", role:"buyer"},
  ...Array.from({length:6},(_,i)=>({email:`supplier${i+1}@infinity.test`, name:`Supplier ${i+1}`, role:"supplier"})),
];
type Ctx={user:User|null; login:(e:string,p:string)=>Promise<boolean>; logout:()=>void; register:(name:string,email:string,pass:string,role:string)=>Promise<string|null>; sync:()=>Promise<void>; isLogged:boolean};
const C=createContext<Ctx>({user:null, login:async()=>false, logout:()=>{}, register:async()=>null, sync:async()=>{}, isLogged:false});

export default function AuthProvider({children}:{children:React.ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  useEffect(()=>{
    const t=localStorage.getItem(TOKEN_KEY);
    if(!t) return;
    apiGetAuth<User>("/user")
      .then(u=>{ setUser(u); localStorage.setItem("infinity_user", JSON.stringify(u)); })
      .catch(()=>{ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem("infinity_user"); });
  },[]);
  const login=async(email:string, pass:string)=>{
    try{
      const j=await apiPost<{user:User; token:string}>("/login",{email, password:pass});
      localStorage.setItem(TOKEN_KEY, j.token);
      localStorage.setItem("infinity_user", JSON.stringify(j.user));
      setUser(j.user);
      return true;
    }catch{ return false; }
  };
  const register=async(name:string,email:string,pass:string,role:string)=>{
    if(!email.includes("@")) return "Email tidak valid";
    if(pass.length<6) return "Password minimal 6 karakter";
    try{
      const j=await apiPost<{user:User; token:string}>("/register",{name, email, password:pass, role: role==="buyer"?"buyer":"supplier"});
      localStorage.setItem(TOKEN_KEY, j.token);
      localStorage.setItem("infinity_user", JSON.stringify(j.user));
      setUser(j.user);
      return null;
    }catch(e:any){
      return e?.data?.errors ? Object.values(e.data.errors).flat().join(" ") : (e?.message || "Gagal daftar");
    }
  };
  const logout=()=>{
    apiPost("/logout").catch(()=>{});
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("infinity_user");
  };
  const sync=async()=>{
    const t=localStorage.getItem(TOKEN_KEY);
    if(!t){ setUser(null); return; }
    try{
      const u=await apiGetAuth<User>("/user");
      setUser(u);
      localStorage.setItem("infinity_user", JSON.stringify(u));
    }catch{ setUser(null); }
  };
  return <C.Provider value={{user, login, logout, register, sync, isLogged:!!user}}>{children}</C.Provider>
}
export const useAuth=()=>useContext(C);
export const demoAccounts=baseUsers;
