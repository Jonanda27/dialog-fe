"use client";

import React, { useState, useEffect } from "react";
import SellerOrderTable from "@/components/order/SellerOrderTable";
import { Loader2, X } from "lucide-react";
// Sesuaikan path import di bawah ini dengan struktur foldermu
import { Order, ShipOrderPayload } from "@/types/order"; 
import { OrderService } from "@/services/api/order.service"; 

export default function ManajemenPesanan() {
  // Menggunakan tipe Order[] bukan array kosong tanpa tipe
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("processing"); // processing, shipped, completed

  // Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const TABS = [
    { id: "processing", label: "Perlu Diproses" },
    { id: "shipped", label: "Sudah Dikirim" },
    { id: "completed", label: "Selesai" },
  ];

  const fetchOrders = async (statusFilter: string) => {
    setLoading(true);
    try {
      // Menyesuaikan mapping status (di DB statusnya 'paid' saat baru dibayar)
      let queryStatus = statusFilter;
      if (statusFilter === "processing") queryStatus = "paid";

      // Panggil API lewat service (Tanpa fetch manual & tanpa pasang token manual)
      const response = await OrderService.getStoreOrders(queryStatus);
      
      // Asumsi response dari axios client membungkus data di properti 'data'
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
      // Bentuk object payload biasa, tidak perlu FormData
      const payload: ShipOrderPayload = {
        tracking_number: trackingNumber
      };

      // Panggil API lewat service
      await OrderService.shipOrder(selectedOrderId, payload);

      alert("Resi berhasil diinput. Pesanan dipindahkan ke tab 'Sudah Dikirim'.");
      setSelectedOrderId(null);
      setTrackingNumber("");
      fetchOrders(activeTab); // Refresh data
    } catch (error: unknown) {
      // Menghindari penggunaan :any pada catch block
      const err = error as Error;
      alert(err.message || "Gagal menginput resi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Manajemen Pesanan</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Pantau pesanan masuk, input resi, dan selesaikan transaksi.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-zinc-900 pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? "text-white border-[#ef3333]" : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Tabel */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ef3333]" size={32} /></div>
        ) : (
          <SellerOrderTable orders={orders} onShipClick={(id) => setSelectedOrderId(id)} />
        )}

        {/* Modal Input Resi */}
        {selectedOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl">
              <button
                onClick={() => { setSelectedOrderId(null); setTrackingNumber(""); }}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Input Resi Pengiriman</h3>
              <p className="text-xs text-zinc-500 mb-8">Masukkan nomor resi yang valid agar dana Anda segera diamankan oleh sistem Escrow.</p>

              <form onSubmit={handleShipSubmit}>
                <div className="mb-8 space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nomor Resi / Tracking Number *</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Contoh: JNT1234567890"
                    required
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !trackingNumber}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Kirim Resi"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}