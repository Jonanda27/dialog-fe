// File: app/penjual/layout.tsx
import AuthGuard from '@/components/layout/AuthGuard';

export default function PenjualLayout({ children }: { children: React.ReactNode }) {
    return (
        // Hanya user dengan role 'seller' yang boleh masuk sini
        <AuthGuard allowedRoles={['seller']}>
            <div className="penjual-layout-container">
                {/* Navbar/Sidebar penjual Anda di sini */}
                {children}
            </div>
        </AuthGuard>
    );
}