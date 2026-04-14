'use client';

import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AreaAutocomplete } from './AreaAutocomplete';
import { BiteshipArea, AddressFormPayload } from '@/types/address';
import { addressService } from '@/services/api/address.service';
import { Loader2 } from 'lucide-react';

// 1. Biarkan Zod menyimpulkan tipenya sendiri tanpa menambahkan ": z.ZodType<AddressFormPayload>"
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
    // 2. Tentukan Generic <AddressFormPayload> di useForm
    const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AddressFormPayload>({
        // @ts-ignore - jika versi zod & resolver bentrok, tapi secara tipe ini sudah aman karena struktur objeknya sama persis
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: '',
            recipient_name: '',
            phone_number: '',
            address_detail: '',
            province: '',
            city: '',
            district: '',
            postal_code: '',
            biteship_area_id: '',
            is_primary: false,
            latitude: null,
            longitude: null,
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-950 p-6 rounded-xl border border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Kolom Input Manual */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Info Penerima</h3>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Label Alamat (Rumah/Kantor)</label>
                        <input {...register('label')} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-700" />
                        {errors.label && <p className="mt-1 text-xs text-red-400">{errors.label.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Penerima</label>
                        <input {...register('recipient_name')} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-700" />
                        {errors.recipient_name && <p className="mt-1 text-xs text-red-400">{errors.recipient_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nomor Telepon</label>
                        <input {...register('phone_number')} type="tel" className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-700" />
                        {errors.phone_number && <p className="mt-1 text-xs text-red-400">{errors.phone_number.message}</p>}
                    </div>
                </div>

                {/* Kolom Logistik & Geografi */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Area & Detail Pengiriman</h3>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Pencarian Wilayah (Kecamatan/Kota)</label>
                        <Controller
                            name="biteship_area_id"
                            control={control}
                            render={({ fieldState }) => (
                                <AreaAutocomplete onSelect={handleAreaSelect} error={fieldState.error?.message} />
                            )}
                        />
                    </div>

                    {/* Read Only Fields */}
                    <div className="grid grid-cols-2 gap-3 opacity-70 pointer-events-none">
                        <input {...register('province')} placeholder="Provinsi" readOnly className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-zinc-400" />
                        <input {...register('city')} placeholder="Kota/Kab" readOnly className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-zinc-400" />
                        <input {...register('district')} placeholder="Kecamatan" readOnly className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-zinc-400" />
                        <input {...register('postal_code')} placeholder="Kode Pos" readOnly className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded text-sm text-zinc-400" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1.5">Detail Alamat Lengkap (Jalan, No, RT/RW)</label>
                        <textarea {...register('address_detail')} rows={3} className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-700 custom-scrollbar" />
                        {errors.address_detail && <p className="mt-1 text-xs text-red-400">{errors.address_detail.message}</p>}
                    </div>
                </div>
            </div>

            <div className="flex items-center mt-4">
                <input type="checkbox" id="is_primary" {...register('is_primary')} className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-zinc-200 focus:ring-zinc-700" />
                <label htmlFor="is_primary" className="ml-2 text-sm text-zinc-400 cursor-pointer">Jadikan sebagai alamat utama</label>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-zinc-100 text-zinc-900 hover:bg-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Alamat
                </button>
            </div>
        </form>
    );
};