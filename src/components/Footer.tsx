import Link from "next/link";
export default function Footer(){
  return (
    <footer className="bg-[#f5f5f5] border-t border-neutral-200 mt-12">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1280px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <div className="text-[11px] tracking-[0.18em] uppercase font-bold">Dapatkan Diskon Panen 10% Off</div>
            <div className="text-[13px] text-neutral-500 mt-1">Promo khusus komoditi petani & bunga</div>
          </div>
          <div className="flex w-full md:w-auto gap-0 max-w-md flex-1">
            <input placeholder="Alamat email kamu" className="flex-1 border border-black h-10 px-4 text-[13px] focus:outline-none" />
            <button className="bg-black text-white h-10 px-8 text-[11px] tracking-[0.14em] uppercase font-bold">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-[11px] tracking-[0.16em] uppercase font-bold mb-4">Bantuan</h4>
          <ul className="space-y-2.5 text-[12px] text-neutral-600">
            <li><Link href="#" className="hover:text-black">Cara Belanja</Link></li>
            <li><Link href="#" className="hover:text-black">Pengembalian 30 Hari</Link></li>
            <li><Link href="#" className="hover:text-black">Kurasi Preloved</Link></li>
            <li><Link href="#" className="hover:text-black">Pusat Bantuan</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.16em] uppercase font-bold mb-4">Tentang</h4>
          <ul className="space-y-2.5 text-[12px] text-neutral-600">
            <li><Link href="#" className="hover:text-black">Tentang INFINITY</Link></li>
            <li><Link href="#" className="hover:text-black">Petani Mitra</Link></li>
            <li><Link href="#" className="hover:text-black">Florist Partner</Link></li>
            <li><Link href="#" className="hover:text-black">Preloved Curated</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.16em] uppercase font-bold mb-4">Kategori</h4>
          <ul className="space-y-2.5 text-[12px] text-neutral-600">
            <li>Komoditi Petani</li><li>Barang Bekas</li><li>Bunga & Florist</li><li>Tanaman Hias</li><li>Kerajinan Tangan</li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.16em] uppercase font-bold mb-4">Hubungi</h4>
          <p className="text-[12px] text-neutral-600 leading-relaxed">support@infinity.co.id<br/>Jl. Kartini VI No.1E Batam - Kepulauan Riau<br/>Senin - Minggu 06.00 - 22.00 WIB</p>
          <div className="flex gap-3 mt-4 text-neutral-400">
            <span className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-xs hover:border-black hover:text-black cursor-pointer">IG</span>
            <span className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-xs hover:border-black hover:text-black cursor-pointer">FB</span>
            <span className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-xs hover:border-black hover:text-black cursor-pointer">WA</span>
          </div>
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur border-t border-neutral-200 text-black">
        <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 justify-between items-center text-[11px]">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="INFINITY" className="h-7 w-28 object-cover object-center" />
            <span className="font-normal opacity-60 tracking-normal normal-case">© 2026 — Tani • Preloved • Florist</span>
          </div>
          <div className="flex gap-4 opacity-60"> <span>Privacy</span> <span>Terms</span> <span>Cookies</span> </div>
        </div>
      </div>
    </footer>
  )
}
