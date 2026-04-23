'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { ChatService } from '@/services/api/chat.service';
import { useChatStore } from '@/store/chatStore';
import axiosClient from '@/services/api/axiosClient';
// Tambahkan icon Menu
import { Loader2, Send, ArrowLeft, ShieldCheck, Paperclip, X, Store, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStoreId = searchParams.get('storeId') || "";
    
    const { user } = useAuthStore();
    
    // --- State Baru untuk Sidebar Toggle ---
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    // --- State Baru untuk Active Store & Chat List ---
    const [activeStoreId, setActiveStoreId] = useState<string>(initialStoreId);
    const [chatList, setChatList] = useState<any[]>([]);

    const [storeName, setStoreName] = useState("Loading...");
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { messages, setMessages, addMessage } = useChatStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- State untuk Preview & Upload Media ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // --- Sinkronisasi ID Pengguna ---
    useEffect(() => {
        let storedId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (storedId === 'undefined' || storedId === 'null') storedId = null;
        
        // Pengecekan berlapis: user.id atau user.user.id (jika nested) atau localStorage
        const id = user?.id || (user as any)?.user?.id || storedId;
        setCurrentUserId(id);
    }, [user]);

    // --- Mengambil Daftar Chat (Sidebar) ---
    useEffect(() => {
        const fetchChatList = async () => {
            try {
                const res = await ChatService.getChatList();
                const list = Array.isArray(res.data) ? res.data : (res as any).data?.data || [];
                setChatList(list);
            } catch (error) {
                console.error("Gagal memuat daftar chat:", error);
            }
        };
        fetchChatList();
    }, []);

    // --- Mengambil Detail Toko yang Aktif ---
    useEffect(() => {
        if (!activeStoreId) return;

        const fetchStoreDetails = async () => {
            try {
                const res = await axiosClient.get(`/stores/${activeStoreId}`);
                const data = res.data?.data || res.data;
                setStoreName(data.name || "Toko Tidak Ditemukan");
            } catch (error) {
                console.error("Gagal memuat detail toko:", error);
                setStoreName("Toko Tidak Ditemukan");
            }
        };

        fetchStoreDetails();
    }, [activeStoreId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Inisialisasi Socket & Riwayat Chat ---
    useEffect(() => {
        const baseUrl = axiosClient.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
        
        const newSocket = io(`${baseUrl}/chat`, {
            auth: { token: localStorage.getItem('token') },
            transports: ['websocket']
        });
        
        setSocket(newSocket);

        if (activeStoreId) {
            setIsLoading(true);
            ChatService.getHistory(activeStoreId)
                .then((res) => {
                    const history = Array.isArray(res.data) ? res.data : (res as any).data?.data || [];
                    setMessages(history);
                })
                .catch((err) => console.error("Gagal memuat history:", err))
                .finally(() => setIsLoading(false));
            
            newSocket.emit('JOIN_STORE', activeStoreId);
        }

        newSocket.on('RECEIVE_MESSAGE', (msg) => {
            addMessage(msg);
        });

        return () => { 
            newSocket.off('RECEIVE_MESSAGE');
            newSocket.disconnect(); 
        };
    }, [activeStoreId, setMessages, addMessage]);

    const selectChat = (storeId: string) => {
        setActiveStoreId(storeId);
        setMessage('');
        cancelAttachment();

        // Auto-tutup sidebar jika diakses melalui layar mobile (< 768px)
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    // --- Batal Pilih Media ---
    const cancelAttachment = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl); 
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- Logic Handle File Selection ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("File terlalu besar. Maksimal 10MB");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // --- Logic Handle Send ---
    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || !activeStoreId || !socket || isUploading) return;
        
        if (selectedFile) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const res = await axiosClient.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { url, message_type } = res.data.data || res.data;

                socket.emit('SEND_MESSAGE', {
                    storeId: activeStoreId,
                    message: message.trim(), 
                    receiverId: null,
                    messageType: message_type,
                    fileUrl: url
                });

                setMessage('');
                cancelAttachment();
            } catch (error) {
                console.error("Gagal upload media:", error);
                alert("Gagal mengirim file media. Silakan coba lagi.");
            } finally {
                setIsUploading(false);
            }
        } else {
            socket.emit('SEND_MESSAGE', { 
                storeId: activeStoreId, 
                message: message.trim(),
                receiverId: null,
                messageType: 'text',
                fileUrl: null
            });
            setMessage('');
        }
    };

    return (
        <div className="flex h-screen bg-[#020202] text-zinc-100 selection:bg-[#ef3333]/30 overflow-hidden">
            
            {/* SIDEBAR: Daftar Toko yang Pernah di-Chat */}
            {/* Kondisional Render Sidebar atau styling lebar & absolute untuk Mobile */}
            {isSidebarOpen && (
                <div className="absolute md:relative z-20 w-full md:w-1/3 lg:w-1/4 h-full border-r border-zinc-800/60 bg-[#09090b] flex flex-col shrink-0 shadow-2xl md:shadow-none">
                    <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.back()} className="p-2 -ml-2 transition-colors rounded-full hover:bg-zinc-800 text-zinc-400">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="font-bold text-zinc-200">Pesan Saya</h2>
                        </div>
                        {/* Tombol Close Sidebar Khusus Layar Mobile */}
                        <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="p-2 text-zinc-400 hover:bg-zinc-800 rounded-full md:hidden transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {chatList.length === 0 ? (
                            <div className="text-center text-zinc-500 text-xs mt-10">Belum ada riwayat chat.</div>
                        ) : (
                            chatList.map((chat, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => selectChat(chat.store_id)}
                                    className={`p-3 md:p-4 mb-1 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeStoreId === chat.store_id ? 'bg-zinc-800' : 'hover:bg-zinc-900/50'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ef3333] to-red-600 flex items-center justify-center font-bold text-sm shrink-0">
                                        {chat.store?.name?.substring(0, 2).toUpperCase() || <Store size={18}/>}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <p className="text-sm font-bold truncate text-zinc-100">{chat.store?.name || 'Toko'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-[#020202]">
                {activeStoreId ? (
                    <>
                        {/* Header Area Chat */}
                        <header className="sticky top-0 z-10 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-md">
                            <div className="flex items-center justify-between px-4 md:px-6 py-4 w-full">
                                <div className="flex items-center gap-3">
                                    {/* Tombol Toggle Sidebar */}
                                    <button 
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                                        className="p-2 -ml-2 transition-colors rounded-full hover:bg-zinc-800 text-zinc-400"
                                        title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
                                    >
                                        <Menu size={20} />
                                    </button>

                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ef3333] to-red-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-red-900/20 shrink-0">
                                        {storeName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="text-sm font-bold tracking-tight truncate">{storeName}</h2>
                                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            ONLINE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Area Pesan (Main) */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                            <div className="max-w-4xl mx-auto px-4 py-8 min-h-full">
                                {isLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ef3333]" size={32} /></div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 gap-3">
                                        <ShieldCheck size={48} className="opacity-20" />
                                        <p className="text-xs font-medium uppercase tracking-widest text-zinc-600 text-center">
                                            Mulai percakapan dengan {storeName}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {messages.map((msg, idx) => {
                                            const msgSenderId = String(msg.sender_id || msg.sender_id || msg.sender?.id || '').trim();
                                            const authUserId = user?.id || (user as any)?.user?.id || currentUserId;
                                            const buyerId = String(authUserId || '').trim();
                                            
                                            const isMe = buyerId !== '' && msgSenderId === buyerId;

                                            return (
                                                <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`relative px-4 py-3 text-[14px] max-w-[85%] md:max-w-[70%] shadow-sm ${
                                                        isMe 
                                                        ? 'bg-[#ef3333] text-white rounded-2xl rounded-tr-sm' 
                                                        : 'bg-zinc-800/90 text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-700/50'
                                                    }`}>
                                                        {msg.message_type === 'image' && msg.file_url && (
                                                            <div className="mb-2 overflow-hidden rounded-lg bg-black/20 flex justify-center">
                                                                <img 
                                                                    src={msg.file_url} 
                                                                    alt="Sent content" 
                                                                    className="max-w-[220px] sm:max-w-[280px] max-h-[320px] w-auto h-auto object-contain"
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}

                                                        {msg.message_type === 'video' && msg.file_url && (
                                                            <div className="mb-2 overflow-hidden rounded-lg bg-black/20 flex justify-center">
                                                                <video controls className="max-w-[220px] sm:max-w-[280px] max-h-[320px] w-auto">
                                                                    <source src={msg.file_url} type="video/mp4" />
                                                                    Browser Anda tidak mendukung video.
                                                                </video>
                                                            </div>
                                                        )}

                                                        {msg.message && (
                                                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.message}</p>
                                                        )}

                                                        <span className={`text-[10px] block mt-1.5 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                                                            {msg.createdAt || msg.createdAt ? 
                                                                new Date(msg.createdAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                                : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>
                        </main>

                        {/* Input Footer */}
                        <footer className="p-4 bg-[#09090b] border-t border-zinc-800/60 flex flex-col gap-3">
                            <div className="max-w-4xl mx-auto w-full">
                                {previewUrl && (
                                    <div className="mb-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl inline-flex gap-3 items-end relative">
                                        <button 
                                            onClick={cancelAttachment}
                                            className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-red-500 rounded-full p-1 shadow-lg transition-all z-10"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="relative overflow-hidden rounded-lg border border-zinc-700/50 bg-black flex items-center justify-center">
                                            {selectedFile?.type.startsWith('video') ? (
                                                <video src={previewUrl} className="h-24 max-w-[200px]" />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="h-24 max-w-[200px] object-contain" />
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-400 pb-1 max-w-[150px] truncate">
                                            {selectedFile?.name}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 items-center bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 focus-within:border-[#ef3333]/50 transition-all shadow-inner">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-2.5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                        title="Lampirkan Gambar atau Video"
                                    >
                                        <Paperclip size={20} />
                                    </button>

                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                    />

                                    <input 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                                        placeholder={selectedFile ? "Tambahkan keterangan..." : "Tulis pesan..."}
                                        disabled={isUploading}
                                    />
                                    
                                    <button 
                                        onClick={handleSend} 
                                        className="bg-[#ef3333] hover:bg-red-600 text-white p-3 rounded-xl transition-all disabled:opacity-30 shadow-lg shadow-[#ef3333]/20 flex items-center justify-center"
                                        disabled={(!message.trim() && !selectedFile) || isUploading}
                                    >
                                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </>
                ) : (
                    /* Tampilan Default saat belum memilih toko */
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 italic bg-[#020202] gap-3 relative">
                        {/* Tombol Toggle Sidebar saat belum memilih chat */}
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)} 
                                className="absolute top-4 left-4 p-2 transition-colors rounded-full hover:bg-zinc-800 text-zinc-400 z-10 shadow-lg"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <Store size={48} className="opacity-20" />
                        <p className="text-sm">Pilih obrolan dari daftar untuk mulai mengirim pesan.</p>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
            `}</style>
        </div>
    );
}