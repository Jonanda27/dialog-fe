"use client";

import React, { Suspense } from 'react';
import GradingHub from '@/components/dashboard/GradingHub';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GradingPage() {
    return (
        <div className="w-full min-h-screen bg-[#0a0a0b] pb-20 selection:bg-red-500/30">
            {/* Minimalist Top Nav */}
            <div className="w-full px-6 py-6 border-b border-zinc-900 flex justify-between items-center bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-50">
                <Link 
                    href="/dashboard" 
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Dashboard
                </Link>
            </div>

            {/* Content Container: Full Width with Grid Padding */}
            <div className="w-full px-4 md:px-8 mt-10">
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 w-full bg-zinc-900/20 border border-zinc-900 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                }>
                    <GradingHub />
                </Suspense>
            </div>
        </div>
    );
}