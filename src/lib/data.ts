// Konfigurasi tampilan + helper format.
// Data katalog (kategori, produk, toko, RFQ, ulasan) 100% dari database
// via src/lib/api.ts + CatalogContext — tidak ada hardcoded di sini.

export const banners = [
  { id: 1, title: "FLASH SALE 11.11", subtitle: "Diskon s/d 90% + Gratis Ongkir", cta: "Serbu Sekarang", href: "/flash-sale", image: "https://picsum.photos/seed/mall-hero1/900/480", theme: "dark" },
  { id: 2, title: "PANEN SEGAR", subtitle: "Komoditi petani langsung dari sawah", cta: "Belanja Tani", href: "/products?category=pertanian", image: "https://picsum.photos/seed/petani-hero/900/480", theme: "light" },
  { id: 3, title: "GADGET FEST", subtitle: "HP, laptop & aksesoris ori bergaransi", cta: "Cek Promo", href: "/products?category=elektronik", image: "https://picsum.photos/seed/gadget-hero/900/480", theme: "dark" },
];

export const vouchers = [
  { code: "PANEN10", name: "Diskon 10% s/d Rp50rb", desc: "Min. belanja Rp100rb, semua kategori", type: "discount", percent: 10, maxDisc: 50000, minSpend: 100000 },
  { code: "GRATISONGKIR", name: "Gratis Ongkir s/d Rp20rb", desc: "Min. belanja Rp50rb, semua kurir", type: "shipping", maxDisc: 20000, minSpend: 50000 },
  { code: "FLASH20", name: "Flash Sale 20% s/d Rp30rb", desc: "Khusus produk Flash Sale", type: "discount", percent: 20, maxDisc: 30000, minSpend: 50000, flashOnly: true },
  { code: "MALL5", name: "Cashback 5% s/d Rp25rb", desc: "Min. belanja Rp150rb toko Badge MALL/GOLD", type: "discount", percent: 5, maxDisc: 25000, minSpend: 150000 },
];

export function formatPrice(n:number){ return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n); }

export function formatSold(n:number){
  if(n>=1000000) return (n/1000000).toFixed(1).replace('.',',')+"JT";
  if(n>=1000) return (n/1000).toFixed(1).replace('.',',').replace(',0','')+"RB";
  return String(n);
}

export function salePrice(p:any){
  if(p.isFlashSale && p.flashPrice) return p.flashPrice;
  return p.price_min;
}

export function discountPct(p:any){
  if(typeof p.discount === "number") return p.discount;
  if(p.price_max > p.price_min) return Math.round((1 - p.price_min / p.price_max) * 100);
  return 0;
}

export function flashSaleEndsAt(){
  const d = new Date();
  d.setHours(23,59,59,999);
  return d.getTime();
}
