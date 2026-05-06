"use client";

import React, { useState, useEffect } from "react";
import SellerOrderTable from "@/components/order/SellerOrderTable";
import { Loader2, X, PackageOpen, Truck, CheckCircle2 } from "lucide-react";
import { Order, ShipOrderPayload } from "@/types/order"; 
import { OrderService } from "@/services/api/order.service"; 

export default function ManajemenPesanan() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("processing");

  // Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const TABS = [
    { id: "processing", label: "Perlu Diproses", icon: PackageOpen },
    { id: "shipped", label: "Sudah Dikirim", icon: Truck },
    { id: "completed", label: "Selesai", icon: CheckCircle2 },
  ];

  const fetchOrders = async (statusFilter: string) => {
    setLoading(true);
    try {
      let queryStatus = statusFilter;
      if (statusFilter === "processing") queryStatus = "paid";

      const response = await OrderService.getStoreOrders(queryStatus);
      if (response && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber || !selectedOrderId) return;

    setSubmitting(true);
    try {
      const payload: ShipOrderPayload = {
        tracking_number: trackingNumber
      };

      await OrderService.shipOrder(selectedOrderId, payload);

      alert("Resi berhasil diinput. Pesanan dipindahkan ke tab 'Sudah Dikirim'.");
      setSelectedOrderId(null);
      setTrackingNumber("");
      fetchOrders(activeTab); 
    } catch (error: unknown) {
      const err = error as Error;
      alert(err.message || "Gagal menginput resi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header Section */}
        <div className="mb-6 md:mb-10 pt-4 md:pt-0">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
            Manajemen Pesanan
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 font-medium mt-1">
            Pantau pesanan masuk, input resi, dan selesaikan transaksi.
          </p>
        </div>

        {/* Responsive Custom Tabs */}
        <div className="flex items-center gap-2 md:gap-8 mb-6 md:mb-8 border-b border-zinc-900 overflow-x-auto no-scrollbar scroll-smooth">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-1 md:px-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap shrink-0 ${
                    activeTab === tab.id 
                    ? "text-white border-[#ef3333]" 
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                <Icon size={14} className={activeTab === tab.id ? "text-[#ef3333]" : ""} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table Content - Wrapper untuk horizontal scroll di mobile */}
        <div className="bg-[#111114] border border-zinc-900 rounded-3xl md:rounded-[2.5rem] overflow-hidden">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#ef3333]" size={40} />
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Sinkronisasi Data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                   <SellerOrderTable orders={orders} onShipClick={(id) => setSelectedOrderId(id)} />
                </div>
            )}
        </div>

        {/* Modal Input Resi - Responsive Sizing */}
        {selectedOrderId && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4 transition-all duration-300">
            <div className="bg-[#111114] border-t md:border border-zinc-900 rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full relative shadow-2xl animate-in slide-in-from-bottom duration-300">
              <button
                onClick={() => { setSelectedOrderId(null); setTrackingNumber(""); }}
                className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Input Resi</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Pastikan nomor resi valid agar dana diteruskan ke saldo toko Anda setelah pembeli menerima barang.
                </p>
              </div>

              <form onSubmit={handleShipSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                    Nomor Resi / Tracking Number *
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNT1234567890"
                    autoFocus
                    required
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333]/20 outline-none transition-all text-white font-mono"
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={submitting || !trackingNumber}
                        className="w-full flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : "Konfirmasi Pengiriman"}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setSelectedOrderId(null)}
                        className="md:hidden w-full py-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest"
                    >
                        Batal
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Global CSS for no-scrollbar */}
        <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>
      </div>
  );
}