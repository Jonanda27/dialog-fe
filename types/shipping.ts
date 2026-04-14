export interface ShippingItemPayload {
    name: string;
    price: number;
    weight: number;
    quantity: number;
}

export interface ShippingRatePayload {
    address_id: string;
    store_id: string;
    items: ShippingItemPayload[];
}

export interface CourierRate {
    courier_company: string;
    courier_name: string;
    service_type: string;
    service_name: string;
    price: number;
    duration: string;
    estimated_delivery: string;
}

// Export CourierOption sebagai alias dari CourierRate agar kompatibel dengan legacy code
export type CourierOption = CourierRate;

// Jika menggunakan Courier interface terpisah di komponen lain
export interface Courier {
    company: string;
    name: string;
    status: string;
}