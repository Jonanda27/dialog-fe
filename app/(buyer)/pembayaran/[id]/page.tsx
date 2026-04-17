'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentService } from '@/services/api/payment.service';
import { Billing } from '@/types/payment';
import { toast } from 'sonner';
import VirtualAccountInfo from '@/components/payment/VirtualAccountInfo';

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
    // Dipindahkan ke atas agar bisa dipanggil oleh triggerSnapEmbed
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
                            // ⚡ PERBAIKAN: Jangan cuma set state, tapi tembak API Verifikasi
                            handleVerifyPayment(true).then((success) => {
                                if (!success) setIsPaid(true); // Fallback UI lunas
                            });
                        },
                        onPending: (result: any) => {
                            console.log('Payment Pending:', result);
                            toast.info('Silakan selesaikan transfer Anda.');
                            // Ambil data terbaru untuk menampilkan No. VA di kolom kiri
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

            // 1. Cek jika sudah lunas
            if (currentBilling.status === 'paid' || pStatus === 'success') {
                setIsPaid(true);
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
                return;
            }

            // 2. Cek jika batal atau expired
            if (['cancelled', 'expired'].includes(currentBilling.status)) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                toast.error('Tagihan ini sudah tidak berlaku.');
                return;
            }

            // 3. Logic Inisiasi Panel Midtrans
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
        
        // Polling tetap jalan untuk mendeteksi perubahan dari Webhook
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
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Menghubungkan ke Gateway...</span>
            </div>
        );
    }

    if (error || !billing) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Tagihan Tidak Valid</h2>
                <button onClick={() => router.push('/katalog')} className="bg-[#ef3333] text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">Kembali Belanja</button>
            </div>
        );
    }

    if (isPaid) {
        return (
            <main className="min-h-screen bg-[#0a0a0b] pt-16 pb-24 flex items-center justify-center px-4">
                <div className="bg-[#111114] border border-zinc-800 p-12 text-center max-w-lg w-full rounded-[2rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-3 uppercase italic">Pembayaran Berhasil!</h1>
                    <p className="text-zinc-400 text-sm mb-10 leading-relaxed">Tagihan <span className="text-white font-bold">#{billing.id.substring(0,8)}</span> telah lunas. Dana telah diamankan dan penjual akan segera memproses pesanan Anda.</p>
                    <button onClick={() => router.push(`/riwayat_pesanan`)} className="w-full bg-white text-black py-5 text-xs font-black tracking-widest uppercase hover:bg-zinc-200 transition-all shadow-xl">Lihat Riwayat Pesanan</button>
                </div>
            </main>
        );
    }

    const rawDate = billing.created_at || (billing as any).createdAt;
    const orderDate = rawDate ? new Date(rawDate) : new Date();
    const expiryDate = new Date(orderDate.getTime() + (24 * 60 * 60 * 1000));
    const expiryTimeIso = expiryDate.toISOString();

    return (
        <main className="min-h-screen bg-[#0a0a0b] pt-24 pb-32">
            <div className="container mx-auto px-4 max-w-5xl text-zinc-200">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic mb-2">Finalisasi Pembayaran</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Master Billing ID: #{billing.id.substring(0, 8)}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <div className="space-y-6 flex flex-col">
                        <VirtualAccountInfo
                            vaNumber={billing.payment_reference || "Selesaikan di panel kanan"}
                            bankName={billing.payment_method || "Metode Pembayaran"}
                            totalAmount={Number(billing.total_amount)}
                            expiryTime={expiryTimeIso}
                        />

                        <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl mt-auto">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest mb-4 italic">Butuh Bantuan?</h3>
                            <p className="text-zinc-500 text-[10px] leading-relaxed mb-4 uppercase font-bold tracking-tight">
                                Jika pembayaran sudah dilakukan namun status belum berubah, tekan tombol sinkronisasi di bawah.
                            </p>
                            <button 
                                onClick={() => handleVerifyPayment(false)}
                                disabled={isVerifying}
                                className="w-full bg-transparent border border-zinc-800 py-3 text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:border-[#ef3333] hover:text-[#ef3333] transition-all disabled:opacity-50"
                            >
                                {isVerifying ? 'Sedang Sinkronisasi...' : 'Saya Sudah Bayar (Cek Status)'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#111114] border border-zinc-800 rounded-3xl overflow-hidden min-h-[600px] relative shadow-2xl flex items-center justify-center">
                        {!snapToken && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111114] z-20">
                                <div className="w-10 h-10 border-2 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Menyiapkan Panel Keamanan...</p>
                            </div>
                        )}
                        <div 
                            id="snap-container" 
                            className="w-full h-full min-h-[600px] bg-white lg:bg-transparent"
                        ></div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-12 italic">
                    🛡️ Pembayaran Aman & Terenkripsi oleh Midtrans Hub
                </p>
            </div>
        </main>
    );
}