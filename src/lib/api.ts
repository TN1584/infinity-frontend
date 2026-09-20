// Klien REST ke backend Laravel (database MySQL infinity_marketplace).
// Semua entitas katalog (kategori, produk, toko, RFQ, ulasan, statistik)
// diambil dari sini — bukan hardcoded di frontend.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status} — ${path}`);
  return r.json();
}

export const TOKEN_KEY = "infinity_token";
export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

async function req<T>(method: string, path: string, body?: any): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err: any = new Error(j.message || `API ${r.status} — ${path}`);
    err.status = r.status;
    err.data = j;
    throw err;
  }
  return j;
}

export const apiPost = <T,>(p: string, b?: any) => req<T>("POST", p, b);
export const apiPut = <T,>(p: string, b?: any) => req<T>("PUT", p, b);
export const apiPatch = <T,>(p: string, b?: any) => req<T>("PATCH", p, b);
export const apiDelete = <T,>(p: string) => req<T>("DELETE", p);
export const apiGetAuth = <T,>(p: string) => req<T>("GET", p);

const pageOf = <T,>(j: any): T[] =>
  Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];

export function discountOf(priceMin: number, priceMax: number) {
  if (priceMax > priceMin && priceMax > 0)
    return Math.round((1 - priceMin / priceMax) * 100);
  return 0;
}

export function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s} detik lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export function budgetLabel(min?: number | null, max?: number | null) {
  const f = (n: number) =>
    n >= 1000000 ? `Rp${(n / 1000000).toLocaleString("id-ID")} jt` : `Rp${Math.round(n / 1000)} rb`;
  if (min && max) return `${f(min)}–${f(max)}`;
  if (max) return `s/d ${f(max)}`;
  return "Sesuai penawaran";
}

// ---------- transform: API → bentuk yang dipakai komponen ----------

export function toCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon || "",
    image: c.image || null,
    count: c.products_count ?? 0,
  };
}

export function toProduct(p: any) {
  const priceMin = Number(p.price_min) || 0;
  const priceMax = Number(p.price_max) || priceMin;
  return {
    id: p.id,
    category: p.category?.slug || "",
    categoryName: p.category?.name || "",
    title: p.title,
    slug: p.slug,
    description: p.description || "",
    specs: p.specs || null,
    price_min: priceMin,
    price_max: priceMax,
    moq: p.moq ?? 1,
    unit: p.unit || "pcs",
    stock: p.stock ?? 0,
    images:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : [`https://picsum.photos/seed/${p.slug || p.id}/400/500`],
    rating: Number(p.rating) || 0,
    sold: p.sold_count ?? 0,
    review_count: p.review_count ?? 0,
    store: {
      name: p.store?.name || "-",
      city: p.store?.city || "",
      badge: String(p.store?.badge || "verified").toLowerCase(),
    },
    is_ready: !!p.is_ready_to_ship,
    is_customizable: !!p.is_customizable,
    has_assurance: !!p.has_trade_assurance,
    is_featured: !!p.is_featured,
    condition: "Baru",
    freeShipping: true,
    discount: discountOf(priceMin, priceMax),
    tier: Array.isArray(p.tier_prices)
      ? p.tier_prices.map((t: any) => ({
          min: t.min,
          max: t.max,
          price: Number(t.price),
        }))
      : [{ min: 1, max: 999, price: priceMin }],
    reviews: Array.isArray(p.reviews)
      ? p.reviews.map((r: any, i: number) => ({
          name: r.user?.name || "Pembeli",
          avatar:
            r.user?.avatar ||
            `https://i.pravatar.cc/100?img=${((p.id + i * 7) % 60) + 1}`,
          rating: Number(r.rating) || 5,
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          text: r.comment || "",
          variant: "Default",
        }))
      : [],
  };
}

export function toStore(s: any) {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    city: s.city || "",
    province: s.province || "",
    badge: String(s.badge || "regular").toUpperCase(),
    rating: Number(s.rating) || 0,
    years: s.years_active ?? 1,
    products: 0,
    response: `${s.response_rate ?? 95}%`,
    responseHours: s.response_time_hours ?? 6,
    avatar: 0,
    logo: s.logo || `https://picsum.photos/seed/${s.slug}-logo/100/100`,
    banner: s.banner || `https://picsum.photos/seed/${s.slug}-store/800/200`,
    description: s.description || "",
    is_factory: !!s.is_factory,
  };
}

export function toRfq(r: any, i = 0) {
  return {
    id: r.id,
    title: r.title,
    qty: r.quantity,
    unit: r.unit,
    budget: budgetLabel(
      r.budget_min != null ? Number(r.budget_min) : null,
      r.budget_max != null ? Number(r.budget_max) : null,
    ),
    quotes: r.quotes_count ?? 0,
    time: timeAgo(r.created_at),
    buyer: r.user?.name || "Pembeli",
    avatar: r.user?.avatar || `https://i.pravatar.cc/100?img=${(r.id % 60) + 1}`,
    deadline: r.deadline || null,
    _rank: i,
  };
}

// ---------- fetch ----------

export const fetchCategories = async () =>
  (await get<any[]>("/categories")).map(toCategory);

export const fetchProducts = async (params = "") => {
  const list = pageOf<any>(await get(`/products?per_page=100${params}`)).map(toProduct);
  // 8 produk dengan diskon terbesar jadi Flash Sale (turunan dari data DB)
  const ids = new Set(
    [...list]
      .sort((a, b) => b.discount - a.discount || b.sold - a.sold)
      .slice(0, 8)
      .map((p) => p.id),
  );
  return list.map((p) =>
    ids.has(p.id) ? { ...p, isFlashSale: true, flashPrice: p.price_min } : p,
  );
};

export const fetchProductDetail = async (slug: string) =>
  toProduct(await get(`/products/${slug}`));

export const fetchStores = async () =>
  pageOf<any>(await get("/stores?per_page=100")).map(toStore);

export const fetchStoreDetail = async (slug: string) => {
  const s = await get<any>(`/stores/${slug}`);
  const store = toStore(s);
  return {
    ...store,
    products: pageOf<any>(s.products || []).map((p: any) =>
      toProduct({ ...p, store: s }),
    ),
  };
};

export const fetchRfqs = async () =>
  pageOf<any>(await get("/rfqs?per_page=50")).map(toRfq);

export const fetchStats = () => get<any>("/stats");

// ---------- order (backend) → bentuk yang dipakai halaman ----------

const ORDER_STATUS: Record<string,string> = {
  pending:"Belum Bayar", confirmed:"Dikemas", shipped:"Dikirim",
  completed:"Selesai", cancelled:"Dibatalkan",
};

export function toOrder(o: any) {
  return {
    id: o.order_no,
    items: (o.items || []).map((it: any) => ({
      slug: it.product?.slug || "",
      title: it.product_title,
      price: Number(it.price),
      qty: it.quantity,
      image: it.product?.images?.[0] || "",
      store: it.product?.store?.name || "",
      selected: true,
    })),
    total: Number(o.total_amount),
    shipping: Number(o.shipping_cost),
    voucher: Number(o.voucher_discount),
    address: o.shipping_address || "",
    payment: o.payment_method,
    courier: o.courier || "",
    status: ORDER_STATUS[o.status] || o.status,
    date: o.created_at,
    notes: o.notes || {},
  };
}

const orderPage = (j: any) => (Array.isArray(j) ? j : (j.data || [])).map(toOrder);

// ---------- endpoint butuh login ----------

export const apiMe = () => apiGetAuth<{name:string;email:string;role:string}>("/user");

export const apiSellerStatus = () => apiGetAuth<any>("/seller/status");
export const apiSellerProducts = async () =>
  pageOf<any>(await apiGetAuth("/seller/products")).map(toProduct);
export const apiSellerOrders = async () =>
  orderPage(await apiGetAuth("/seller/orders"));
export const apiMyOrders = async () =>
  orderPage(await apiGetAuth("/orders?per_page=50"));
export const apiAdmin = {
  overview: () => apiGetAuth<any>("/admin/overview"),
  sellers: (status = "") => apiGetAuth<any>(`/admin/sellers${status ? `?status=${status}` : ""}`),
  products: () => apiGetAuth<any>("/admin/products?per_page=100"),
  orders: () => apiGetAuth<any>("/admin/orders?per_page=50"),
  users: () => apiGetAuth<any>("/admin/users?per_page=100"),
};
