"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  LogOut,
  Heart,
  Bell,
  ChevronDown,
  Zap,
  HelpCircle,
  Globe,
  Plus,
  Loader2,
  LayoutGrid,
  ArrowRight,
  Star,
  Trash2,
  User as UserIcon,
  Settings,
  Package,
} from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { StoreService } from "@/services/api/store.service";
import { CategoryService } from "@/services/api/category.service";

const formatImageUrl = (path: string | undefined) => {
  if (!path) return "https://placehold.co/400x400?text=No+Image";
  if (path.startsWith("http")) return path;
  return `http://localhost:5000/${path.replace(/^\/+/, "")}`;
};

export default function BuyerNavbar() {
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const { items, isAnimate } = useCartStore();
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await CategoryService.getAllCategories();
        setCategories(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchWallet = async () => {
      if (isInitialized && user?.role === "seller") {
        try {
          setIsLoadingWallet(true);
          const res = await StoreService.getWallet();
          if (res.data && res.data.balance) {
            const numericBalance =
              typeof res.data.balance === "string"
                ? parseFloat(res.data.balance)
                : res.data.balance;
            setWalletBalance(numericBalance || 0);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };
    fetchWallet();
  }, [user, isInitialized]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const recentItems = items.slice(0, 3);

  return (
    <header className="fixed top-0 w-full z-[100] transition-all duration-500">
      {/* TIER 1: UTILITY */}
      <div className="bg-[#0a0a0b] border-b border-zinc-900/50 py-2.5 px-6 hidden lg:block">
        <div className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
          <div className="flex items-center gap-8">
            <Link href="/deals" className="text-zinc-500 hover:text-white transition-colors">
              Daily Deals
            </Link>
            <Link href="/sell" className="text-[#ef3333] hover:text-red-400 transition-colors flex items-center gap-1.5">
              <Zap size={12} fill="currentColor" /> Sell on Analog
            </Link>
            <Link href="/help" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5">
              <HelpCircle size={12} /> Help
            </Link>
          </div>
          <div className="flex items-center gap-8 text-zinc-500">
            <Link href="/orders" className="hover:text-white transition-colors">
              Shipment Tracking
            </Link>
            <button className="hover:text-white transition-colors flex items-center gap-1.5">
              Watchlist <Heart size={12} />
            </button>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              ID <Globe size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* TIER 2: MAIN HUB */}
      <div className={`transition-all duration-500 px-6 ${scrolled ? "bg-[#111114]/95 backdrop-blur-md py-4 shadow-2xl" : "bg-[#0a0a0b] py-6"}`}>
        <div className="w-full flex items-center justify-between gap-12">
          {/* LOGO SECTION - UPDATED TO USE IMAGE */}
          <Link href="/dashboard" className="shrink-0 flex items-center transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/logo.png" 
              alt="Analog.id Logo" 
              className="h-10 w-auto object-contain" 
            />
          </Link>

          <div className="hidden md:flex flex-1 relative group">
            <div className="w-full flex items-center bg-[#1a1a1e] border border-zinc-800 rounded-full overflow-hidden focus-within:border-[#ef3333]/50 focus-within:ring-4 focus-within:ring-[#ef3333]/5 transition-all">
              <div className="pl-6 pr-3 text-zinc-600">
                <Search size={18} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Cari vinyl, kaset, audio gear..."
                className="flex-1 bg-transparent px-2 py-4 text-xs font-bold text-zinc-200 placeholder:text-zinc-600 outline-none"
              />
              <button className="bg-[#ef3333] hover:bg-red-700 text-white px-12 py-4 text-[11px] font-black uppercase tracking-widest transition-all">
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <button className="relative text-zinc-400 hover:text-white transition-colors hidden sm:block">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b]"></span>
            </button>

            {/* KERANJANG DENGAN DROPDOWN */}
            <div className="relative group/cart py-2">
              <Link
                href="/cart"
                className={`relative flex items-center justify-center text-zinc-400 hover:text-[#ef3333] transition-all p-2 rounded-full hover:bg-white/5 ${isAnimate ? "animate-cart-bounce text-[#ef3333]" : ""}`}
              >
                <ShoppingBag size={24} />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ef3333] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0b]">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="absolute top-full right-0 w-[420px] bg-[#111114] border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-5 opacity-0 translate-y-4 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-[150]">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Crate</span>
                    <span className="text-[10px] font-black text-[#ef3333] uppercase">{cartCount} Items</span>
                  </div>

                  {items.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {recentItems.map((item) => (
                          <div key={item.cart_item_id} className="flex items-center gap-4 group/item">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800 transition-transform group-hover/item:scale-105">
                              <img
                                src={formatImageUrl(item.product.media?.find((m) => m.is_primary)?.media_url)}
                                className="w-full h-full object-cover"
                                alt={item.product.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Error+Load"; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                              <h5 className="text-[12px] font-black text-white uppercase truncate tracking-tight mb-1">{item.product.name}</h5>
                              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[12px] font-black text-[#ef3333] italic">Rp {Number(item.product.price).toLocaleString("id-ID")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link href="/cart" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ef3333] hover:text-white transition-all shadow-lg active:scale-95">
                        Go to Checkout <ArrowRight size={14} />
                      </Link>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-700">
                        <ShoppingBag size={20} />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Your Crate is Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

            {/* PROFILE DROPDOWN */}
            {isMounted && isAuthenticated && user ? (
              <div className="relative group/profile py-2">
                <Link href="/dashboard" className="flex items-center gap-4 group/avatar">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}&backgroundColor=ef3333`}
                      className="w-11 h-11 rounded-full border-2 border-zinc-800 group-hover/avatar:border-[#ef3333] transition-all"
                      alt="Avatar"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111114] rounded-full"></div>
                  </div>
                  <div className="hidden xl:flex flex-col text-left leading-none">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight flex items-center gap-1">
                      {user.full_name.split(" ")[0]}{" "}
                      <ChevronDown size={10} className="group-hover/profile:rotate-180 transition-transform" />
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Collector</span>
                  </div>
                </Link>

                <div className="absolute top-full right-0 w-64 bg-[#111114] border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-2 opacity-0 translate-y-4 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:translate-y-0 group-hover/profile:pointer-events-auto transition-all duration-300 z-[150]">
                  <div className="p-3 border-b border-zinc-900 mb-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                    <p className="text-[12px] font-black text-white truncate uppercase tracking-tight">{user.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-900 group/link transition-colors">
                      <UserIcon size={16} className="text-zinc-600 group-hover/link:text-[#ef3333]" />
                      <span className="text-[11px] font-bold text-zinc-400 group-hover/link:text-white uppercase tracking-widest">Akun Saya</span>
                    </Link>
                    <Link href="/riwayat_pesanan" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-900 group/link transition-colors">
                      <Package size={16} className="text-zinc-600 group-hover/link:text-[#ef3333]" />
                      <span className="text-[11px] font-bold text-zinc-400 group-hover/link:text-white uppercase tracking-widest">Pesanan Saya</span>
                    </Link>
                    <Link href="/grading" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-900 group/link transition-colors">
                      <Star size={16} className="text-zinc-600 group-hover/link:text-[#ef3333]" />
                      <span className="text-[11px] font-bold text-zinc-400 group-hover/link:text-white uppercase tracking-widest">Grading</span>
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-900 group/link transition-colors border-t border-zinc-900 pt-3">
                      <Settings size={16} className="text-zinc-600 group-hover/link:text-[#ef3333]" />
                      <span className="text-[11px] font-bold text-zinc-400 group-hover/link:text-white uppercase tracking-widest">Settings</span>
                    </Link>
                    <button onClick={() => logout()} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 group/logout transition-colors">
                      <LogOut size={16} className="text-zinc-600 group-hover/logout:text-[#ef3333]" />
                      <span className="text-[11px] font-bold text-zinc-400 group-hover/logout:text-[#ef3333] uppercase tracking-widest">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white">Sign In</Link>
                <Link href="/auth/register" className="bg-white text-black px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#ef3333] hover:text-white transition-all shadow-xl">Join</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIER 3 (CATEGORIES) */}
      {!scrolled && (
        <div className="bg-[#0a0a0b] border-t border-zinc-900 px-6 hidden lg:block relative">
          <div className="w-full flex items-center justify-center gap-10">
            <div className="relative group/all">
              <button className="flex items-center gap-3 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] group-hover/all:text-[#ef3333] transition-colors">
                <LayoutGrid size={16} /> All Categories
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-[1000px] bg-[#111114] border border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-8 rounded-b-[3rem] opacity-0 translate-y-4 pointer-events-none group-hover/all:opacity-100 group-hover/all:translate-y-0 group-hover/all:pointer-events-auto transition-all duration-300 z-[110]">
                <div className="grid grid-cols-12 gap-10 text-left">
                  <div className="col-span-8 grid grid-cols-3 gap-8">
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-4">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2 border-b border-zinc-800 pb-2">
                          {cat.icon} {cat.name}
                        </h4>
                        <div className="flex flex-col gap-2">
                          {cat.subCategories?.map((sub: any) => (
                            <Link key={sub.id} href={`/search?sub_category=${sub.id}`} className="text-[10px] font-bold text-zinc-500 hover:text-[#ef3333] transition-colors">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-4 bg-zinc-900/50 rounded-[2rem] p-6 border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ef3333]/10 rounded-full flex items-center justify-center text-[#ef3333] mb-4">
                        <Star size={20} fill="currentColor" />
                      </div>
                      <h4 className="text-white font-black text-xl leading-tight">Collect your<br />next obsession</h4>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Things. People. Love.</p>
                    </div>
                    <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ef3333] hover:text-white transition-all mt-6">Shop now</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group/item">
                  <Link href={`/search?category=${cat.id}`} className="py-4 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-[0.2em] whitespace-nowrap transition-all block border-b-2 border-transparent group-hover/item:border-[#ef3333] group-hover/item:text-white text-center">
                    {cat.name}
                  </Link>
                  <div className="fixed left-0 right-0 top-[auto] mt-0 w-screen bg-[#111114] border-b border-zinc-800 shadow-[0_40px_80px_rgba(0,0,0,0.9)] opacity-0 translate-y-4 pointer-events-none group-hover/item:opacity-100 group-hover/item:translate-y-0 group-hover/item:pointer-events-auto transition-all duration-300 z-[110] px-20 py-12">
                    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-16 text-left">
                      <div className="col-span-3">
                        <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Top categories</h4>
                        <div className="flex flex-col gap-4">
                          {cat.subCategories?.slice(0, 8).map((sub: any) => (
                            <Link key={sub.id} href={`/search?sub_category=${sub.id}`} className="text-sm font-bold text-zinc-200 hover:text-[#ef3333] transition-colors">{sub.name}</Link>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Featured</h4>
                        <div className="flex flex-col gap-4">
                          {cat.subCategories?.slice(0, 5).map((sub: any) => (
                            <Link key={sub.id} href={`/search?sub_category=${sub.id}`} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">{sub.name} Selection</Link>
                          ))}
                          <Link href="/deals" className="text-sm font-black text-[#ef3333] flex items-center gap-2 mt-4 underline underline-offset-8">
                            Explore All {cat.name} <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                      <div className="col-span-6 relative rounded-[2.5rem] overflow-hidden group/banner min-h-[300px]">
                        <img src="https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105" alt="Cat Banner" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                          <div className="space-y-2">
                            <h3 className="text-white text-3xl font-black tracking-tighter leading-none uppercase italic">The Analog<br />Next-Gen</h3>
                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Limited Edition {cat.name}</p>
                          </div>
                          <button className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#ef3333] hover:text-white transition-all shadow-2xl">Shop now</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3) translateY(-5px); }
        }
        .animate-cart-bounce { animation: cartBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </header>
  );
}