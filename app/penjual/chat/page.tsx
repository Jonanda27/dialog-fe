'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axiosClient from '@/services/api/axiosClient';
import { ChatService } from '@/services/api/chat.service'; 
import { User, Send, Info, Paperclip, X, Loader2, MessageCircle } from 'lucide-react';
// 1. Import useAuthStore untuk mendapatkan data user login
import { useAuthStore } from "@/store/authStore"; 

export default function PenjualChatPage() {
    // 2. Ambil data user dari Zustand Store
    const { user } = useAuthStore(); 
    
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- State Baru untuk Preview & Upload Media ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 3. Sinkronisasi ID Pengguna dari Store
    useEffect(() => {
        if (user && user.id) {
            setCurrentUserId(user.id);
            console.log("--- DEBUG AUTH STORE ---");
            console.log("ID Penjual dari Store:", user.id);
        }
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Mengambil daftar percakapan unik untuk penjual menggunakan axios langsung 
        axiosClient.get('/chat/penjual/list')
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : res.data.data || [];
                setChats(list);
            })
            .catch(err => console.error("Gagal mengambil daftar chat:", err));
    }, []);

    useEffect(() => {
        const baseUrl = axiosClient.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
        
        // Pastikan token diambil untuk koneksi socket [cite: 1516]
        const token = localStorage.getItem('token'); 
        const newSocket = io(`${baseUrl}/chat`, {
            auth: { token: token }
        });
        setSocket(newSocket);

        newSocket.on('RECEIVE_MESSAGE', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => { newSocket.disconnect(); };
    }, []);

    const selectChat = async (chat: any) => {
        setSelectedChat(chat.sender_id);
        socket?.emit('JOIN_STORE', chat.store_id); 
        
        // --- MENGGUNAKAN SERVICE getHistory  ---
        try {
            const res = await ChatService.getHistory(chat.store_id);
            const history = Array.isArray(res.data) ? res.data : (res as any).data?.data || [];
            
            // Filter history untuk memastikan hanya pesan antara penjual dan pembeli spesifik ini [cite: 1130]
            const filteredHistory = history.filter((msg: any) => 
                msg.sender_id === chat.sender_id || msg.receiver_id === chat.sender_id
            );
            
            setMessages(filteredHistory);
        } catch (err) {
            console.error("Gagal memuat history chat:", err);
            setMessages([]);
        }
            
        // Reset input state when switching chat
        setMessage('');
        cancelAttachment();
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

    // --- Logic Handle Send [cite: 1519] ---
    const handleSend = async () => {
        const currentChat = chats.find(c => c.sender_id === selectedChat);
        const storeId = currentChat?.store_id;

        if ((!message.trim() && !selectedFile) || !storeId || !selectedChat || !socket || isUploading) return;
        
        if (selectedFile) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                // Hit API Upload [cite: 820]
                const res = await axiosClient.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { url, message_type } = res.data.data || res.data;

                // Emit socket setelah upload beres [cite: 1520]
                socket.emit('SEND_MESSAGE', { 
                    storeId,
                    receiverId: selectedChat, 
                    message: message.trim(),
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
        } 
        else {
            socket.emit('SEND_MESSAGE', { 
                storeId,
                receiverId: selectedChat, 
                message: message.trim(),
                messageType: 'text',
                fileUrl: null
            });
            setMessage('');
        }
    };

    return (
        <div className="flex h-screen bg-[#09090b] text-white selection:bg-[#ef3333]/30">
            {/* SIDEBAR */}
            <div className="w-1/3 border-r border-zinc-800/60 bg-[#09090b] flex flex-col">
                <div className="p-6 border-b border-zinc-800/60">
                    <h2 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <MessageCircle size={18} className="text-[#ef3333]" />
                        Pesan Masuk
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chats.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 text-xs italic">Belum ada pesan masuk</div>
                    ) : (
                        chats.map((chat) => (
                            <div 
                                key={chat.sender_id || chat.id}
                                onClick={() => selectChat(chat)}
                                className={`p-4 mx-2 my-1 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${selectedChat === chat.sender_id ? 'bg-[#ef3333]/10 border border-[#ef3333]/20' : 'hover:bg-zinc-800/50 border border-transparent'}`}
                            >
                                <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                                    <User size={20} className={selectedChat === chat.sender_id ? "text-[#ef3333]" : "text-zinc-500"} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className={`text-sm font-bold truncate ${selectedChat === chat.sender_id ? "text-white" : "text-zinc-300"}`}>
                                        {chat.sender?.full_name || 'Pembeli'}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {chat.message_type === 'image' ? '📸 Gambar' : 
                                         chat.message_type === 'video' ? '🎥 Video' : 
                                         chat.message || 'Klik untuk membalas...'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col bg-[#050505]">
                {selectedChat ? (
                    <>
                        <div className="px-6 py-4 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                    <User size={18} className="text-[#ef3333]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-100">
                                        {chats.find(c => c.sender_id === selectedChat)?.sender?.full_name || 'Pembeli'}
                                    </p>
                                    <p className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Info size={18} className="text-zinc-500" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                            {messages?.map((msg, i) => {
                                const senderId = String(msg.sender_id || '').trim();
                                const myId = String(currentUserId).trim();
                                const isMe = myId !== '' && myId === senderId;
                                
                                return (
                                    <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                                            <div className={`p-4 rounded-2xl shadow-lg ${
                                                isMe ? 'bg-[#ef3333] text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/50'
                                            }`}>
                                                {msg.message_type === 'image' && msg.file_url && (
                                                    <div className="mb-2 overflow-hidden rounded-lg bg-black/20">
                                                        <img src={msg.file_url} alt="Media" className="max-w-[220px] sm:max-w-[280px] max-h-[320px] object-contain" />
                                                    </div>
                                                )}
                                                {msg.message_type === 'video' && msg.file_url && (
                                                    <div className="mb-2 overflow-hidden rounded-lg bg-black/20">
                                                        <video controls className="max-w-[220px] sm:max-w-[280px] max-h-[320px]">
                                                            <source src={msg.file_url} type="video/mp4" />
                                                        </video>
                                                    </div>
                                                )}
                                                {msg.message && <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                            </div>
                                            {/* Tampilan Waktu (CreatedAt) */}
                                            <span className="text-[10px] mt-1.5 text-zinc-500 font-medium px-1">
                                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="p-4 bg-[#09090b] border-t border-zinc-800/60 shrink-0 flex flex-col gap-3">
                            {previewUrl && (
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl inline-flex gap-3 items-end relative self-start shadow-xl">
                                    <button onClick={cancelAttachment} className="absolute -top-2 -right-2 bg-[#ef3333] text-white rounded-full p-1.5 shadow-lg">
                                        <X size={14} />
                                    </button>
                                    <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-black h-24 w-24 flex items-center justify-center">
                                        {selectedFile?.type.startsWith('video') ? <video src={previewUrl} className="object-cover h-full w-full" /> : <img src={previewUrl} className="object-cover h-full w-full" />}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 truncate max-w-[120px] pb-1">{selectedFile?.name}</p>
                                </div>
                            )}

                            <div className="flex gap-3 items-center bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 focus-within:border-[#ef3333]/40 transition-all">
                                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-3 text-zinc-400 hover:text-[#ef3333] transition-all">
                                    <Paperclip size={20} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                <input 
                                    className="flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-zinc-600"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={selectedFile ? "Tambahkan keterangan..." : "Ketik balasan..."}
                                />
                                <button onClick={handleSend} className="bg-[#ef3333] p-3.5 rounded-xl hover:bg-red-600 transition-all disabled:opacity-30 flex items-center justify-center">
                                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-[#050505] gap-4">
                        <MessageCircle size={48} className="opacity-20 text-[#ef3333]" />
                        <p className="text-sm font-medium">Pilih percakapan dari sidebar untuk mulai membalas</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef3333; }
            `}</style>
        </div>
    );
}