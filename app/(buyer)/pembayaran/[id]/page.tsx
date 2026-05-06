'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentService } from '@/services/api/payment.service';
import { Billing } from '@/types/payment';
import { toast } from 'sonner';
import VirtualAccountInfo from '@/components/payment/VirtualAccountInfo';
import { Loader2, CheckCircle2, ShoppingBag, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PembayaranPage() {
    const params = useParams();
    const router = useRouter();
    const billingId = params.id as string;

    const [billing, setBilling] = useState<Billing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [snapToken, setSnapToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const hasInitializedRef = useRef(false);
    const snapEmbedInitiatedRef = useRef(false); 
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // ⚡ FUNGSI VERIFIKASI (Force Sync ke Midtrans API)
    const handleVerifyPayment = useCallback(async (silent = false) => {
        if (isVerifying) return;
        if (!silent) setIsVerifying(true);
        
        try {
            const response = await PaymentService.verifyPayment(billingId);
            const status = response.data.payment_status;
            const bStatus = response.data.billing.status;

            if (status === 'success' || bStatus === 'paid') {
                setIsPaid(true);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                if (!silent) toast.success('Pembayaran berhasil dikonfirmasi!');
                return true;
            } else {
                if (!silent) toast.info('Pembayaran belum terdeteksi sistem.');
                return false;
            }
        } catch (err) {
            console.error("Gagal verifikasi manual");
            return false;
        } finally {
            if (!silent) setIsVerifying(false);
        }
    }, [billingId, isVerifying]);

    // ⚡ FUNGSI 1: Menampilkan Midtrans secara EMBEDDED
    const triggerSnapEmbed = useCallback((token: string) => {
        if (snapEmbedInitiatedRef.current) return;

        const snap = (window as any).snap;

        if (typeof window !== 'undefined' && snap) {
            try {
                snapEmbedInitiatedRef.current = true;

                setTimeout(() => {
                    const container = document.getElementById('snap-container');
                    if (!container) {
                        snapEmbedInitiatedRef.current = false; 
                        return;
                    }

                    container.innerHTML = '';

                    snap.embed(token, {
                        embedId: 'snap-container',
                        onSuccess: (result: any) => {
                            console.log('Payment Success Callback:', result);
                            handleVerifyPayment(true).then((success) => {
                                if (!success) setIsPaid(true);
                            });
                        },
                        onPending: (result: any) => {
                            console.log('Payment Pending:', result);
                            toast.info('Silakan selesaikan transfer Anda.');
                            fetchBillingStatus(false);
                        },
                        onError: (result: any) => {
                            console.error('Payment Error:', result);
                            toast.error('Terjadi kesalahan pada modul pembayaran.');
                            snapEmbedInitiatedRef.current = false;
                        },
                        onClose: () => {
                            console.log('User menutup panel embedded');
                        }
                    });
                }, 500); 
            } catch (err) {
                console.error("Snap Embed Execution Error:", err);
                snapEmbedInitiatedRef.current = false;
            }
        }
    }, [handleVerifyPayment]);

    // ⚡ FUNGSI 3: Polling Status & Sinkronisasi Initial
    const fetchBillingStatus = useCallback(async (isInitialFetch = false) => {
        try {
            const response = await PaymentService.getBillingStatus(billingId);
            const result = response.data;
            const currentBilling = result.billing;
            const pStatus = result.payment_status;

            if (!currentBilling) throw new Error("Billing data not found");
            setBilling(currentBilling);

            if (currentBilling.status === 'paid' || pStatus === 'success') {
                setIsPaid(true);
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
                return;
            }

            if (['cancelled', 'expired'].includes(currentBilling.status)) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                toast.error('Tagihan ini sudah tidak berlaku.');
                return;
            }

            if (currentBilling.status === 'unpaid') {
                let currentToken = snapToken;

                if (!currentToken) {
                    const sessionResponse = await PaymentService.createPaymentSession(billingId);
                    currentToken = sessionResponse.data.token;
                    setSnapToken(currentToken);
                }

                if (currentToken && !snapEmbedInitiatedRef.current) {
                    triggerSnapEmbed(currentToken);
                }
            }

        } catch (err: any) {
            if (isInitialFetch) {
                setError('Data tagihan tidak ditemukan.');
            }
            console.error("Gagal sinkronisasi status:", err);
        } finally {
            if (isInitialFetch) setIsLoading(false);
        }
    }, [billingId, triggerSnapEmbed, snapToken]);

    useEffect(() => {
        if (!billingId || hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        fetchBillingStatus(true);
        
        pollingIntervalRef.current = setInterval(() => fetchBillingStatus(false), 8000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [billingId, fetchBillingStatus]);

    // --- RENDER LOGIC ---

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-[#ef3333] animate-spin mb-4" />
                <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menghubungkan ke Gateway Keamanan...</span>
            </div>
        );
    }

    if (error || !billing) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase  tracking-tighter">Tagihan Tidak Valid</h2>
                <p className="text-zinc-500 text-sm mb-8 max-w-xs">Data tagihan tidak ditemukan atau telah kedaluwarsa.</p>
                <button onClick={() => router.push('/katalog')} className="w-full max-w-xs bg-[#ef3333] text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20">Kembali Belanja</button>
            </div>
        );
    }

    if (isPaid) {
        return (
            <main className="min-h-screen bg-[#0a0a0b] py-20 flex items-center justify-center px-4 sm:px-6">
                <div className="bg-[#111114] border border-zinc-800 p-8 md:p-12 text-center max-w-lg w-full rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 size={48} className="md:w-12 md:h-12" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-4 uppercase ">Pembayaran Berhasil!</h1>
                    <p className="text-zinc-400 text-sm mb-10 leading-relaxed">
                        Tagihan <span className="text-white font-bold">#{billing.id.substring(0,8).toUpperCase()}</span> telah lunas. Dana telah diamankan dan penjual akan segera memproses pesanan Anda.
                    </p>
                    <button onClick={() => router.push(`/riwayat_pesanan`)} className="w-full bg-white text-black py-5 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-zinc-200 transition-all shadow-xl active:scale-95">Lihat Riwayat Pesanan</button>
                </div>
            </main>
        );
    }

    const rawDate = billing.created_at || (billing as any).createdAt;
    const orderDate = rawDate ? new Date(rawDate) : new Date();
    const expiryDate = new Date(orderDate.getTime() + (24 * 60 * 60 * 1000));
    const expiryTimeIso = expiryDate.toISOString();

    return (
        <main className="min-h-screen bg-[#0a0a0b] pt-3 pb-24 md:pb-32 selection:bg-[#ef3333] selection:text-white">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl text-zinc-200">
                
                {/* Header Section */}
                <div className="mb-10 md:mb-14 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ef3333]/10 border border-[#ef3333]/20 rounded-full text-[#ef3333] text-[9px] font-black uppercase tracking-widest mb-4">
                        <ShieldCheck size={12} /> Secure Checkout
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase  mb-3 leading-none">Finalisasi <span className="text-[#ef3333]">Pembayaran</span></h1>
                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">Master Billing ID: #{billing.id.substring(0, 12).toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Info & Sync */}
                    <div className="lg:col-span-5 space-y-6 flex flex-col">
                        <VirtualAccountInfo
                            vaNumber={billing.payment_reference || "Pilih metode di panel sebelah"}
                            bankName={billing.payment_method || "Payment Hub"}
                            totalAmount={Number(billing.total_amount)}
                            expiryTime={expiryTimeIso}
                        />

                        <div className="bg-[#111114] border border-zinc-800 p-6 md:p-8 rounded-[2rem] shadow-xl">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#ef3333] rounded-full"></span> Butuh Bantuan?
                            </h3>
                            <p className="text-zinc-500 text-[10px] leading-relaxed mb-6 uppercase font-bold tracking-tight">
                                Jika Anda telah menyelesaikan transfer namun status belum terperbarui secara otomatis, silakan lakukan sinkronisasi manual di bawah ini.
                            </p>
                            <button 
                                onClick={() => handleVerifyPayment(false)}
                                disabled={isVerifying}
                                className="group w-full bg-zinc-900 border border-zinc-800 py-4 rounded-xl text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:border-[#ef3333] hover:text-[#ef3333] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isVerifying ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                                )}
                                {isVerifying ? 'Sinkronisasi Status...' : 'Cek Status Pembayaran'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Midtrans Snap Module */}
                    <div className="lg:col-span-7 bg-[#111114] border border-zinc-800 rounded-[2rem] overflow-hidden min-h-[550px] md:min-h-[650px] relative shadow-2xl flex items-center justify-center">
                        {!snapToken && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111114] z-20 p-8 text-center">
                                <Loader2 className="w-10 h-10 text-[#ef3333] animate-spin mb-4" />
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Menghubungkan ke Saluran Enkripsi...</p>
                            </div>
                        )}
                        
                        {/* Snap Embed Container */}
                        <div 
                            id="snap-container" 
                            className="w-full h-full min-h-[550px] md:min-h-[650px] bg-white lg:bg-[#f8f9fa] rounded-none md:rounded-none"
                        ></div>
                    </div>
                </div>

                {/* Footer Security Badge */}
                <div className="mt-12 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Midtrans.png" alt="Midtrans" className="h-4 md:h-5 object-contain" />
                    </div>
                    <p className="max-w-md text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                        🛡️ Transaksi Anda dienkripsi ujung-ke-ujung (E2EE). <br className="hidden md:block" />
                        Semua data kartu dan perbankan diproses melalui Midtrans Secure Gateway.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                /* Menyesuaikan tampilan Midtrans di dalam container agar lebih menyatu */
                #snap-container iframe {
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                    min-height: 550px !important;
                }
                @media (min-width: 768px) {
                    #snap-container iframe {
                        min-height: 650px !important;
                    }
                }
            `}</style>
        </main>
    );
}