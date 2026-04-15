import React from "react";
// 1. IMPORT TIPE DATA DARI FOLDER TYPES KITA
import { WalletTransaction } from "@/types/store";

// 2. DEFINISIKAN INTERFACE PROPS DENGAN STRICT TYPE
interface TransactionTableProps {
  transactions: WalletTransaction[];
}

// 3. TERAPKAN KE KOMPONEN
export default function TransactionTable({ transactions }: TransactionTableProps) {
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500 font-medium text-sm border border-zinc-800 rounded-3xl">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-3xl overflow-hidden bg-[#0a0a0b]">
      <table className="w-full text-left text-sm text-zinc-400">
        <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500">
          <tr>
            <th className="px-6 py-4 font-black">ID Referensi</th>
            <th className="px-6 py-4 font-black">Tipe</th>
            <th className="px-6 py-4 font-black">Sumber</th>
            <th className="px-6 py-4 font-black">Nominal</th>
            <th className="px-6 py-4 font-black">Tanggal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {transactions.map((trx) => (
            <tr key={trx.id} className="hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-xs">{trx.reference_id || "-"}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  trx.type === 'CREDIT' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {trx.type}
                </span>
              </td>
              <td className="px-6 py-4 uppercase text-xs font-bold text-white">{trx.source}</td>
              <td className={`px-6 py-4 font-black ${trx.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trx.type === 'CREDIT' ? '+' : '-'} Rp {Number(trx.amount).toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4 text-xs">
                {new Date(trx.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}