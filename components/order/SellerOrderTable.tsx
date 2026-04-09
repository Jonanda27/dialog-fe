import React from "react";
import { Package, Truck, CheckCircle } from "lucide-react";

interface Props {
    orders: any[];
    onShipClick: (orderId: string) => void;
}

export default function SellerOrderTable({ orders, onShipClick }: Props) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#111114] border border-zinc-900 rounded-[2.5rem]">
                <Package size={48} className="text-zinc-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Tidak Ada Pesanan</h3>
                <p className="text-sm text-zinc-500 mt-2">Belum ada transaksi di kategori ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="text-[10px] uppercase font-black text-zinc-500 bg-[#0a0a0b] border-b border-zinc-900">
                    <tr>
                        <th className="px-6 py-5">Order ID</th>
                        <th className="px-6 py-5">Pembeli</th>
                        <th className="px-6 py-5">Item (Produk)</th>
                        <th className="px-6 py-5">Total Pendapatan</th>
                        <th className="px-6 py-5 text-right">Aksi / Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#1a1a1f] transition-colors">
                            <td className="px-6 py-5 font-mono text-xs text-white">#{order.id.split('-')[0]}</td>
                            <td className="px-6 py-5 text-white font-medium">{order.buyer?.name}</td>
                            <td className="px-6 py-5">
                                <ul className="list-disc list-inside">
                                    {order.items?.map((item: any) => (
                                        <li key={item.id} className="text-xs">
                                            {item.product?.name} <span className="text-zinc-500">x{item.qty}</span>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="px-6 py-5 text-emerald-400 font-bold">
                                Rp {Number(order.grand_total).toLocaleString('id-ID')}
                            </td>
                            <td className="px-6 py-5 text-right">
                                {order.status === 'paid' || order.status === 'processing' ? (
                                    <button
                                        onClick={() => onShipClick(order.id)}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                                    >
                                        <Truck size={14} /> Input Resi
                                    </button>
                                ) : order.status === 'shipped' ? (
                                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">
                                        Sedang Dikirim ({order.tracking_number})
                                    </span>
                                ) : order.status === 'completed' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                                        <CheckCircle size={12} /> Selesai
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase text-zinc-500">{order.status}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}