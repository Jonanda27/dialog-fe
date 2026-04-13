import { redirect } from 'next/navigation';

export default function PenjualIndexPage() {
    // Otomatis arahkan rute /penjual menuju /penjual/dashboard
    redirect('/penjual/dashboard');
}