"use client";

import React, { useState, useEffect } from "react";
import GradingRequestTable from "@/components/grading/GradingRequestTable";
import { Loader2, X } from "lucide-react";

export default function GradingDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedGradingId, setSelectedGradingId] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : null;
    };

    const fetchRequests = async () => {
        try {
            const token = getCookie("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grading/store-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // ⚡ FIX: Check status SEBELUM parse JSON
            if (!res.ok) {
                const errorText = await res.text();
                console.error('API Error:', res.status, errorText);
                throw new Error(`API Error: ${res.status}`);
            }

            const data = await res.json();
            if (data.data) {
                setRequests(data.data);
            } else if (Array.isArray(data)) {
                setRequests(data);
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
            const token = getCookie("token");
            const formData = new FormData();
            formData.append("video", videoFile);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grading/${selectedGradingId}/fulfill`, {
                method: "PATCH", // ⚡ Sesuai dengan grading.service.ts
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Biarkan browser mengatur batas multipart boundary
                },
                body: formData,
            });

            // ⚡ FIX: Check status SEBELUM parse JSON
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Upload Error:', res.status, errorText);
                throw new Error(`Upload gagal: ${res.status}`);
            }

            const data = await res.json();
            alert("Video grading berhasil diunggah!");
            setSelectedGradingId(null);
            setVideoFile(null);
            fetchRequests(); // Rehidrasi tabel
        } catch (error: any) {
            console.error("Error uploading:", error);
            alert(error.message || "Gagal mengunggah video. Coba lagi atau hubungi support.");
        } finally {
            setUploading(false);
        }
    };

    return (
            <div className="max-w-5xl mx-auto pb-20">
                <div className="mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Grading Center</h2>
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                        Pusat pemenuhan permintaan video fisik (Grading) dari calon pembeli.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ef3333]" size={32} /></div>
                ) : (
                    <GradingRequestTable requests={requests} onUploadClick={(id) => setSelectedGradingId(id)} />
                )}

                {/* Upload Modal (Hanya muncul jika ada grading yang dipilih) */}
                {selectedGradingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl">
                            <button
                                onClick={() => { setSelectedGradingId(null); setVideoFile(null); }}
                                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Upload Video</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Format MP4/MOV, Maks 50MB</p>

                            <form onSubmit={handleUploadSubmit}>
                                <div className="mb-8">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        required
                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 transition-all cursor-pointer"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading || !videoFile}
                                    className="w-full flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : "Kirim Video"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
    );
}