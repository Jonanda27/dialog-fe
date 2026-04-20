"use client";

import React, { useState, useEffect } from "react";
import GradingRequestTable from "@/components/grading/GradingRequestTable";
import { Loader2, X, UploadCloud } from "lucide-react";
import gradingService from "@/services/api/grading.service";

export default function GradingDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedGradingId, setSelectedGradingId] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const fetchRequests = async () => {
        try {
            const response = await gradingService.getStoreRequests();
            if (response.data) {
                setRequests(response.data as any);
            } else if (Array.isArray(response)) {
                setRequests(response as any);
            }
        } catch (error) {
            console.error("Gagal memuat data grading:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile || !selectedGradingId) return;

        setUploading(true);
        try {
            await gradingService.fulfillGrading(selectedGradingId, {
                video_file: videoFile
            });

            alert("Video grading berhasil diunggah!");
            setSelectedGradingId(null);
            setVideoFile(null);
            fetchRequests();
        } catch (error: any) {
            console.error("Error uploading:", error);
            const errorMsg = error.response?.data?.message || error.message || "Gagal mengunggah video.";
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                        Grading <span className="text-[#ef3333]">Center</span>
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium mt-1 max-w-md">
                        Manajemen permintaan inspeksi video fisik. Pastikan video memperlihatkan detail produk dengan jelas.
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total Permintaan</p>
                    <p className="text-xl font-bold text-white">{requests.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-[#ef3333]" size={40} />
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Menghubungkan ke Server...</p>
                </div>
            ) : (
                <GradingRequestTable requests={requests} onUploadClick={(id) => setSelectedGradingId(id)} />
            )}

            {/* Upload Modal */}
            {selectedGradingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 transition-all">
                    <div className="bg-[#0a0a0b] border border-zinc-800 rounded-[2.5rem] p-10 max-w-md w-full relative shadow-[0_0_50px_-12px_rgba(239,51,51,0.2)]">
                        <button
                            onClick={() => { setSelectedGradingId(null); setVideoFile(null); }}
                            className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                                <UploadCloud className="text-[#ef3333]" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Kirim Video</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
                                MP4/MOV • Max 50MB • Kualitas Min. 720p
                            </p>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="video/*"
                                    required
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                    className="block w-full text-xs text-zinc-400 
                                    file:mr-4 file:py-4 file:px-6 
                                    file:rounded-2xl file:border-0 
                                    file:text-[10px] file:font-black file:uppercase file:tracking-widest 
                                    file:bg-zinc-800 file:text-white 
                                    hover:file:bg-[#ef3333] transition-all cursor-pointer
                                    bg-zinc-900/50 rounded-2xl border border-zinc-800 group-hover:border-zinc-700"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={uploading || !videoFile}
                                className="w-full flex items-center justify-center gap-3 bg-[#ef3333] hover:bg-red-700 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale shadow-lg shadow-red-900/20"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Sedang Mengunggah...
                                    </>
                                ) : "Konfirmasi & Kirim"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}