export interface BiteshipArea {
    biteship_area_id: string;
    formatted_name: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
}

export interface Address {
    id?: string;
    label: string;
    recipient_name: string;
    phone_number: string;
    address_detail: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    biteship_area_id: string;
    latitude?: number | null;
    longitude?: number | null;
    is_primary: boolean;
}

export interface AddressFormPayload extends Omit<Address, 'id'> { }