/**
 * Payload yang dikirim Frontend ke Backend saat pembeli memilih alamat di halaman Checkout
 * POST /api/orders/shipping-cost
 */
export interface CalculateShippingPayload {
    origin: string;      // ID atau Nama Kota/Kecamatan asal (Lokasi Toko)
    destination: string; // ID atau Nama Kota/Kecamatan tujuan (Alamat Pembeli)
    weight: number;      // Total berat seluruh barang dalam keranjang (satuan: gram)
}

/**
 * Opsi Kurir yang dikembalikan oleh Backend API Logistik
 * Digunakan untuk me-render pilihan JNE/SiCepat dsb di halaman Checkout.
 */
export interface CourierOption {
    courier_code: string;  // cth: 'jne', 'sicepat'
    courier_name: string;  // cth: 'JNE (Jalur Nugraha Ekakurir)'
    service_type: string;  // cth: 'REG', 'YES', 'HALU'
    service_name: string;  // cth: 'Layanan Reguler'
    cost: number;          // Harga ongkos kirim dalam Rupiah (Rp 15.000)
    etd: string;           // Estimated Time of Delivery (cth: '2-3 Hari')
}