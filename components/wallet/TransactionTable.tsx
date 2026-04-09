import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet, Clock } from "lucide-react";

interface Transaction {
    id: string;
    type: "CREDIT" | "DEBIT";
    amount: string;
    source: string;
    reference_id: string;
    created_at: string;
}

interface Props {
    transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#111114] border border-zinc-900 rounded-[2.5rem]">
                <Wallet size={48} className="text-zinc-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Belum Ada Transaksi</h3>
                <p className="text-sm text-zinc-500 mt-2">Riwayat pemasukan dan penarikan dana akan muncul di sini.</p>
            </div>
        );
    }

    const formatSource = (source: string) => {
        const maps: Record<string, string> = {
            'order_release': 'Penjualan Produk',
            'withdrawal': 'Penarikan Dana (Withdraw)',
            'adjustment': 'Penyesuaian Sistem'
        };
        return maps[source] || source;
    };

    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-zinc-900 flex items-center gap-3">
                <Clock className="text-zinc-500" size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Riwayat Mutasi</h3>
            </div>
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="text-[10px] uppercase font-black text-zinc-500 bg-[#0a0a0b] border-b border-zinc-900">
                    <tr>
                        <th className="px-6 lg:px-8 py-5">Waktu Transaksi</th>
                        <th className="px-6 lg:px-8 py-5">Jenis Mutasi</th>
                        <th className="px-6 lg:px-8 py-5 text-right">Nominal (Rp)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                    {transactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-[#1a1a1f] transition-colors">
                            <td className="px-6 lg:px-8 py-5">
                                <p className="text-white font-medium">{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mt-1">Ref: {trx.reference_id?.split('-')[0] || '-'}</p>
                            </td>
                            <td className="px-6 lg:px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {trx.type === 'CREDIT' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{formatSource(trx.source)}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-zinc-500">
                                            {trx.type === 'CREDIT' ? 'Dana Masuk' : 'Dana Keluar'}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 lg:px-8 py-5 text-right">
                                <span className={`font-black tracking-widest ${trx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {trx.type === 'CREDIT' ? '+' : '-'} {Number(trx.amount).toLocaleString('id-ID')}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}