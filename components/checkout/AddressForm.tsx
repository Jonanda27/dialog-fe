'use client';

import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AreaAutocomplete } from './AreaAutocomplete';
import { BiteshipArea, AddressFormPayload } from '@/types/address';
import { addressService } from '@/services/api/address.service';
import { Loader2 } from 'lucide-react';

const addressSchema = z.object({
    label: z.string().min(1, 'Label wajib diisi'),
    recipient_name: z.string().min(1, 'Nama wajib diisi'),
    phone_number: z.string().min(8, 'Nomor telepon tidak valid'),
    address_detail: z.string().min(5, 'Detail alamat terlalu singkat'),
    province: z.string().min(1, 'Pilih area dari daftar'),
    city: z.string().min(1, 'Pilih area dari daftar'),
    district: z.string().min(1, 'Pilih area dari daftar'),
    postal_code: z.string().min(1, 'Pilih area dari daftar'),
    biteship_area_id: z.string().min(1, 'Pilih area dari daftar'),
    is_primary: z.boolean(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

interface AddressFormProps {
    onSuccess: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ onSuccess }) => {
    const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AddressFormPayload>({
        // @ts-ignore
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: '', recipient_name: '', phone_number: '', address_detail: '',
            province: '', city: '', district: '', postal_code: '', biteship_area_id: '',
            is_primary: false, latitude: null, longitude: null,
        }
    });

    const onSubmit: SubmitHandler<AddressFormPayload> = async (data) => {
        try {
            await addressService.addAddress(data);
            onSuccess();
        } catch (error) {
            console.error('Failed to submit address', error);
        }
    };

    const handleAreaSelect = (area: BiteshipArea) => {
        setValue('province', area.province, { shouldValidate: true });
        setValue('city', area.city, { shouldValidate: true });
        setValue('district', area.district, { shouldValidate: true });
        setValue('postal_code', String(area.postal_code), { shouldValidate: true });
        setValue('biteship_area_id', area.biteship_area_id, { shouldValidate: true });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-[#1a1a1e] p-6 rounded-2xl border border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Input Manual */}
                <div className="space-y-5">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800 pb-2">Info Penerima</h3>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Label Alamat (Rumah/Kantor)</label>
                        <input {...register('label')} className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333] transition-all" />
                        {errors.label && <p className="mt-1 text-xs text-[#ef3333] italic">{errors.label.message}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Nama Penerima</label>
                        <input {...register('recipient_name')} className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333] transition-all" />
                        {errors.recipient_name && <p className="mt-1 text-xs text-[#ef3333] italic">{errors.recipient_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Nomor Telepon</label>
                        <input {...register('phone_number')} type="tel" className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333] transition-all" />
                        {errors.phone_number && <p className="mt-1 text-xs text-[#ef3333] italic">{errors.phone_number.message}</p>}
                    </div>
                </div>

                {/* Kolom Logistik & Geografi */}
                <div className="space-y-5">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800 pb-2">Area & Detail Pengiriman</h3>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Pencarian Wilayah (Kecamatan/Kota)</label>
                        <Controller
                            name="biteship_area_id"
                            control={control}
                            render={({ fieldState }) => (
                                <AreaAutocomplete onSelect={handleAreaSelect} error={fieldState.error?.message} />
                            )}
                        />
                    </div>

                    {/* Read Only Fields */}
                    <div className="grid grid-cols-2 gap-3 opacity-60 pointer-events-none">
                        <input {...register('province')} placeholder="Provinsi" readOnly className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300" />
                        <input {...register('city')} placeholder="Kota/Kab" readOnly className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300" />
                        <input {...register('district')} placeholder="Kecamatan" readOnly className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300" />
                        <input {...register('postal_code')} placeholder="Kode Pos" readOnly className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Detail Alamat Lengkap (Jalan, No, RT/RW)</label>
                        <textarea {...register('address_detail')} rows={3} className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333] transition-all resize-none" />
                        {errors.address_detail && <p className="mt-1 text-xs text-[#ef3333] italic">{errors.address_detail.message}</p>}
                    </div>
                </div>
            </div>

            <div className="flex items-center mt-6">
                <input type="checkbox" id="is_primary" {...register('is_primary')} className="w-4 h-4 rounded border-zinc-700 bg-[#0a0a0b] accent-[#ef3333] cursor-pointer" />
                <label htmlFor="is_primary" className="ml-3 text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Jadikan sebagai alamat utama</label>
            </div>

            <div className="pt-6 border-t border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-white text-black hover:bg-[#ef3333] hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center shadow-lg"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Alamat
                </button>
            </div>
        </form>
    );
};