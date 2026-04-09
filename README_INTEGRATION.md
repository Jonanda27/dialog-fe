

```markdown
# 🚀 PANDUAN INTEGRASI FRONTEND & BACKEND (Analog.id)

Halo tim Frontend! Mulai sekarang, kita menggunakan **Arsitektur API Bridge & Zustand**. Arsitektur ini dibuat agar kerja kalian jauh lebih mudah, rapi, dan bebas dari *error* siluman.

Tolong baca panduan ini dari atas ke bawah secara berurutan sebelum kalian *ngoding* komponen React/Next.js.

---

## 🛑 BAB 1: ATURAN MUTLAK (JANGAN DILANGGAR)

Untuk menjaga kode tetap bersih, hindari 4 dosa besar ini saat membuat komponen UI:
1. **JANGAN PAKAI `fetch()` ATAU `axios` MANUAL DI KOMPONEN.** Semua fungsi panggil API sudah disiapkan di folder `services/api/`. Kalian tinggal panggil fungsinya.
2. **JANGAN PERNAH BIKIN `new FormData()` DI KOMPONEN.** Kalau mau kirim gambar/file, kirim saja dalam bentuk JavaScript *Object* biasa. Sistem kita di *services* akan otomatis merakitnya menjadi `FormData`.
3. **JANGAN SENTUH TOKEN JWT ATAU LOCALSTORAGE UNTUK AUTH.** Kalian tidak perlu repot-repot nge-set `Authorization: Bearer <token>`. Sistem kita sudah otomatis menyisipkan token ke setiap API *request*.
4. **JANGAN PAKAI TIPE `any`.** Kalau kalian butuh tahu apa isi dari `Product` atau `Order`, import tipe datanya dari folder `types/`.

---

## 📂 BAB 2: MENGENAL FOLDER PENTING

Kalian hanya perlu berurusan dengan 3 folder utama ini:

* 📁 **`types/` (Kamus Data):** Berisi TypeScript Interface. Kalian buka folder ini kalau bingung *"Kolom di database ini namanya `release_year` atau `year` ya?"*
* 📁 **`services/api/` (Tukang Pos):** Berisi kumpulan fungsi API. Contoh: `ProductService.create()`, `AuthService.login()`. Folder ini yang berkomunikasi langsung dengan Backend.
* 📁 **`store/` (Otak & Memori):** Berisi Zustand. Kalau data perlu disimpan dan dipakai di banyak halaman (seperti keranjang belanja, data *user* yang lagi login, atau katalog produk), panggil datanya lewat sini.

---

## 🛠️ BAB 3: CARA KERJA & CONTOH KODE (TUTORIAL)

Berikut adalah panduan urut cara mengimplementasikan arsitektur ini di komponen UI kalian.

### Kasus 1: Mengambil Data Sederhana (Tanpa Zustand)
Gunakan cara ini kalau datanya cuma dipakai di satu halaman saja (contoh: melihat detail pesanan).

```tsx
import { useEffect, useState } from 'react';
import { OrderService } from '@/services/api/order.service'; // Panggil Service
import { Order } from '@/types/order'; // Panggil Tipe Data
import { ApiError } from '@/types/api';

export default function DetailPesanan({ idPesanan }: { idPesanan: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Panggil service-nya (Gak usah mikirin token/header!)
        const response = await OrderService.getById(idPesanan); 
        
        // 2. response.data adalah data asli dari backend
        setOrder(response.data);
      } catch (error) {
        // 3. Tangkap error secara elegan
        const err = error as ApiError;
        alert(err.message); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idPesanan]);

  if (loading) return <p>Loading...</p>;
  return <h1>Pesanan: {order?.id}</h1>;
}
```

### Kasus 2: Memakai Zustand Store (Sangat Disarankan)
Gunakan ini untuk fitur utama (Login, Tambah Produk, Lihat Saldo). Zustand akan otomatis mengurus status *loading* dan *error* buat kalian!

```tsx
import { useAuthStore } from '@/store/authStore'; // Import Zustand Store-nya

export default function TombolLogout() {
  // 1. Ekstrak data dan fungsinya
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <p>Silakan Login Dulu</p>;
  }

  return (
    <div>
      <p>Halo Bos, {user?.name}</p>
      {/* 2. Tinggal pasang fungsinya di onClick */}
      <button onClick={() => logout()}>Keluar Akun</button>
    </div>
  );
}
```

### Kasus 3: Kirim Form & Upload Gambar (BACA BAIK-BAIK!)
Ingat aturan nomor 2: **JANGAN PAKAI FORM DATA DI KOMPONEN.** Kalian cukup menyusun datanya menjadi JavaScript *Object* biasa, meskipun ada *file* gambarnya.

```tsx
import { useState } from 'react';
import { useProductStore } from '@/store/productStore';

export default function FormTambahProduk() {
  const { createProduct, isLoading } = useProductStore();
  
  const [namaVinyl, setNamaVinyl] = useState('');
  const [fotoDepan, setFotoDepan] = useState<File | null>(null); // State untuk File Foto

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // PERHATIKAN INI! Kirim sebagai object biasa.
      // Urusan ngerubah ke FormData akan diurus otomatis oleh ProductService.
      await createProduct({
        name: namaVinyl,
        artist: 'The Beatles',
        price: 150000,
        photos: {
          front: fotoDepan, // Langsung masukin objek File-nya ke sini
          back: null,
          physical: null
        }
      });
      alert('Berhasil upload produk!');
    } catch (err) {
      console.log('Gagal upload');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={(e) => setNamaVinyl(e.target.value)} />
      {/* Input File biasa */}
      <input type="file" onChange={(e) => setFotoDepan(e.target.files?.[0] || null)} />
      <button type="submit" disabled={isLoading}>Simpan</button>
    </form>
  );
}
```

### Kasus 4: Nangkep Error Validasi (Tulisan Merah di Bawah Input)
Kalau Backend menolak data kalian (misal: "Email tidak valid"), Backend akan melempar status *Error 400*. Sistem kita akan merapikannya menjadi `err.errors` agar gampang dibaca.

```tsx
import { useState } from 'react';
import { AuthService } from '@/services/api/auth.service';
import { ApiError } from '@/types/api';

export default function Register() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    try {
      setFormErrors({}); // Reset error tiap klik submit
      await AuthService.register({ name: 'A', email: 'salah', password: '123', role: 'buyer' });
    } catch (error) {
      const err = error as ApiError;
      
      // Jika errornya dari validasi Backend (Zod Error 400)
      if (err.errors) {
        const errorMessages: Record<string, string> = {};
        err.errors.forEach(item => {
          // item.field = nama kotak input (misal 'password')
          // item.message = alasan ditolak (misal 'Password minimal 6 karakter')
          errorMessages[item.field] = item.message; 
        });
        setFormErrors(errorMessages);
      } else {
        // Error server biasa (Error 500)
        alert(err.message);
      }
    }
  };

  return (
    <div>
      <input name="email" placeholder="Email" />
      {/* Munculin tulisan merah kalau ada error di kolom email */}
      {formErrors['email'] && <p className="text-red-500 text-sm">{formErrors['email']}</p>}
    </div>
  );
}
```

---
**✨ KESIMPULAN**
Dengan arsitektur ini, tugas kalian di Frontend murni cuma memikirkan **Tampilan (UI)** dan **UX**. Sisanya, biarkan *Store* dan *Services* yang bekerja! Selamat *ngoding*! 🎧
```

***

Buku panduan ini sudah disusun dengan gaya bahasa yang tegas namun sangat mudah dipahami (*foolproof explanation*). Rekan FE Anda hanya perlu mencontek struktur di "Kasus 3" untuk upload file, dan "Kasus 4" untuk menampilkan *error* merah di input *form*. Semuanya sudah beres! Ada lagi yang perlu kita poles, Coach?