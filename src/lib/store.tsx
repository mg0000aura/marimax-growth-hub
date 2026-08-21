import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getDb, firebaseEnabled } from "./firebase";
import {
  defaultSettings,
  type ActivityLog,
  type Banner,
  type CartItem,
  type Coupon,
  type Order,
  type Post,
  type Product,
  type Profile,
  type Review,
  type Settings,
} from "./types";

const PREFIX = "marimax:";

function readLocal<T>(name: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + name);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(name: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

async function loadCollection<T extends { id: string }>(name: string): Promise<T[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id }));
  } catch {
    return null;
  }
}

async function loadSettingsRemote(): Promise<Partial<Settings> | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    return snap.exists() ? (snap.data() as Partial<Settings>) : null;
  } catch {
    return null;
  }
}

async function saveDocRemote(name: string, id: string, value: unknown) {
  const db = getDb();
  if (!db) return;
  try {
    await setDoc(doc(db, name, id), value as Record<string, unknown>, { merge: true });
  } catch {
    /* offline: fica salvo localmente */
  }
}

async function removeDocRemote(name: string, id: string) {
  const db = getDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, name, id));
  } catch {
    /* ignore */
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

type StoreValue = {
  ready: boolean;
  products: Product[];
  reviews: Review[];
  posts: Post[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  profiles: Profile[];
  activity: ActivityLog[];
  settings: Settings;
  cart: CartItem[];
  favorites: string[];
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  registerProductView: (id: string) => void;
  saveReview: (r: Review) => void;
  deleteReview: (id: string) => void;
  savePost: (p: Post) => void;
  deletePost: (id: string) => void;
  saveOrder: (o: Order) => void;
  saveCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  saveBanner: (b: Banner) => void;
  deleteBanner: (id: string) => void;
  saveProfile: (p: Profile) => void;
  updateSettings: (s: Partial<Settings>) => void;
  log: (who: string, what: string) => void;
  addToCart: (item: CartItem) => void;
  setCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    async function boot() {
      const local = {
        products: readLocal<Product[]>("products", []),
        reviews: readLocal<Review[]>("reviews", []),
        posts: readLocal<Post[]>("posts", []),
        orders: readLocal<Order[]>("orders", []),
        coupons: readLocal<Coupon[]>("coupons", []),
        banners: readLocal<Banner[]>("banners", []),
        profiles: readLocal<Profile[]>("profiles", []),
        activity: readLocal<ActivityLog[]>("activity", []),
      };
      setProducts(local.products);
      setReviews(local.reviews);
      setPosts(local.posts);
      setOrders(local.orders);
      setCoupons(local.coupons);
      setBanners(local.banners);
      setProfiles(local.profiles);
      setActivity(local.activity);
      setSettings({ ...defaultSettings, ...readLocal("settings", {}) });
      setCart(readLocal<CartItem[]>("cart", []));
      setFavorites(readLocal<string[]>("favorites", []));

      if (firebaseEnabled) {
        const [p, r, b, o, c, bn, pr, act, st] = await Promise.all([
          loadCollection<Product>("products"),
          loadCollection<Review>("reviews"),
          loadCollection<Post>("posts"),
          loadCollection<Order>("orders"),
          loadCollection<Coupon & { id: string }>("coupons"),
          loadCollection<Banner>("banners"),
          loadCollection<Profile>("profiles"),
          loadCollection<ActivityLog>("activity"),
          loadSettingsRemote(),
        ]);
        if (!alive) return;
        if (p) {
          setProducts(p);
          writeLocal("products", p);
        }
        if (r) setReviews(r);
        if (b) setPosts(b);
        if (o) setOrders(o);
        if (c) setCoupons(c.map((x) => ({ code: x.code ?? x.id, percent: x.percent, active: x.active })));
        if (bn) setBanners(bn);
        if (pr) setProfiles(pr);
        if (act) setActivity([...act].sort((a, b2) => b2.createdAt - a.createdAt).slice(0, 300));
        if (st) setSettings((prev) => ({ ...prev, ...st, visits: prev.visits, views: prev.views }));
      }
      if (alive) setReady(true);
    }
    void boot();
    return () => {
      alive = false;
    };
  }, []);

  // Contador simples de visitas (por sessão do navegador).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(PREFIX + "visited")) return;
    window.sessionStorage.setItem(PREFIX + "visited", "1");
    setSettings((s) => {
      const next = { ...s, visits: (s.visits ?? 0) + 1 };
      writeLocal("settings", next);
      return next;
    });
  }, []);

  const persist = useCallback(
    <T,>(name: string, value: T) => {
      writeLocal(name, value);
    },
    [],
  );

  const value = useMemo<StoreValue>(() => {
    const upsert = <T extends { id: string }>(
      list: T[],
      item: T,
      setter: (v: T[]) => void,
      name: string,
    ) => {
      const next = list.some((x) => x.id === item.id)
        ? list.map((x) => (x.id === item.id ? item : x))
        : [item, ...list];
      setter(next);
      persist(name, next);
      void saveDocRemote(name, item.id, item);
    };

    const drop = <T extends { id: string }>(
      list: T[],
      id: string,
      setter: (v: T[]) => void,
      name: string,
    ) => {
      const next = list.filter((x) => x.id !== id);
      setter(next);
      persist(name, next);
      void removeDocRemote(name, id);
    };

    return {
      ready,
      products,
      reviews,
      posts,
      orders,
      coupons,
      banners,
      profiles,
      activity,
      settings,
      cart,
      favorites,
      saveProduct: (p) => upsert(products, p, setProducts, "products"),
      deleteProduct: (id) => drop(products, id, setProducts, "products"),
      registerProductView: (id) => {
        setProducts((list) => {
          const next = list.map((p) => (p.id === id ? { ...p, views: (p.views ?? 0) + 1 } : p));
          persist("products", next);
          return next;
        });
        setSettings((s) => {
          const next = { ...s, views: (s.views ?? 0) + 1 };
          persist("settings", next);
          return next;
        });
      },
      saveReview: (r) => upsert(reviews, r, setReviews, "reviews"),
      deleteReview: (id) => drop(reviews, id, setReviews, "reviews"),
      savePost: (p) => upsert(posts, p, setPosts, "posts"),
      deletePost: (id) => drop(posts, id, setPosts, "posts"),
      saveOrder: (o) => upsert(orders, o, setOrders, "orders"),
      saveCoupon: (c) => {
        const next = coupons.some((x) => x.code === c.code)
          ? coupons.map((x) => (x.code === c.code ? c : x))
          : [c, ...coupons];
        setCoupons(next);
        persist("coupons", next);
        void saveDocRemote("coupons", c.code, c);
      },
      deleteCoupon: (code) => {
        const next = coupons.filter((x) => x.code !== code);
        setCoupons(next);
        persist("coupons", next);
        void removeDocRemote("coupons", code);
      },
      saveBanner: (b) => upsert(banners, b, setBanners, "banners"),
      deleteBanner: (id) => drop(banners, id, setBanners, "banners"),
      saveProfile: (p) => upsert(profiles, p, setProfiles, "profiles"),
      updateSettings: (s) => {
        setSettings((prev) => {
          const next = { ...prev, ...s };
          persist("settings", next);
          void saveDocRemote("settings", "site", next);
          return next;
        });
      },
      log: (who, what) => {
        setActivity((prev) => {
          const next = [{ id: uid(), who, what, createdAt: Date.now() }, ...prev].slice(0, 200);
          persist("activity", next);
          return next;
        });
      },
      addToCart: (item) => {
        setCart((prev) => {
          const found = prev.find((x) => x.productId === item.productId);
          const next = found
            ? prev.map((x) => (x.productId === item.productId ? { ...x, qty: x.qty + item.qty } : x))
            : [...prev, item];
          persist("cart", next);
          return next;
        });
      },
      setCartQty: (productId, qty) => {
        setCart((prev) => {
          const next = prev
            .map((x) => (x.productId === productId ? { ...x, qty } : x))
            .filter((x) => x.qty > 0);
          persist("cart", next);
          return next;
        });
      },
      removeFromCart: (productId) => {
        setCart((prev) => {
          const next = prev.filter((x) => x.productId !== productId);
          persist("cart", next);
          return next;
        });
      },
      clearCart: () => {
        setCart([]);
        persist("cart", []);
      },
      toggleFavorite: (productId) => {
        setFavorites((prev) => {
          const next = prev.includes(productId)
            ? prev.filter((x) => x !== productId)
            : [...prev, productId];
          persist("favorites", next);
          return next;
        });
      },
    };
  }, [
    ready,
    products,
    reviews,
    posts,
    orders,
    coupons,
    banners,
    profiles,
    activity,
    settings,
    cart,
    favorites,
    persist,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}
