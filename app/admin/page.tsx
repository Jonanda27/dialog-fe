import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
    // Otomatis arahkan rute /admin menuju /admin/dashboard
    redirect('/admin/dashboard');
}