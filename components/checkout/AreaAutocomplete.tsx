'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { shippingService } from '@/services/api/address.service';
import { BiteshipArea } from '@/types/address';

interface AreaAutocompleteProps {
    onSelect: (area: BiteshipArea) => void;
    error?: string;
    defaultValue?: string;
}

export const AreaAutocomplete: React.FC<AreaAutocompleteProps> = ({ onSelect, error, defaultValue = '' }) => {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<BiteshipArea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAreas = async () => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }
            setIsLoading(true);
            setApiError(null);
            try {
                const results = await shippingService.getAreas(query);
                setSuggestions(results);
                setIsOpen(true);
            } catch (err: any) {
                setApiError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            // Mencegah re-fetch saat user memilih item (karena query berubah menjadi formatted_name)
            const isExactMatch = suggestions.some(s => s.formatted_name === query);
            if (!isExactMatch) fetchAreas();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelection = (area: BiteshipArea) => {
        setQuery(area.formatted_name);
        setIsOpen(false);
        onSelect(area);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0 || apiError) setIsOpen(true); }}
                    className={`w-full pl-10 pr-10 py-2.5 bg-zinc-900 border ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-800 focus:border-zinc-700 focus:ring-zinc-700'
                        } rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all`}
                    placeholder="Cari Kecamatan atau Kota..."
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                    {apiError ? (
                        <div className="p-4 text-sm text-red-400 text-center">{apiError}</div>
                    ) : suggestions.length > 0 ? (
                        <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                            {suggestions.map((area) => (
                                <li
                                    key={area.biteship_area_id}
                                    onClick={() => handleSelection(area)}
                                    className="flex items-start px-4 py-3 cursor-pointer hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                                >
                                    <MapPin className="h-4 w-4 text-zinc-500 mt-0.5 mr-3 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {area.district}, {area.city}
                                        </span>
                                        <span className="text-xs text-zinc-500 mt-0.5">
                                            {area.province} • {area.postal_code}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : query.length >= 3 && !isLoading ? (
                        <div className="p-4 text-sm text-zinc-500 text-center">Area tidak ditemukan.</div>
                    ) : null}
                </div>
            )}
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>
    );
};