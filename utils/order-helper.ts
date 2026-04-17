// utils/order-helper.ts
export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending_payment': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'paid':
        case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        case 'completed':
        case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
};

export const formatStatus = (status: string) => status.replace('_', ' ').toUpperCase();