export interface TourHighlight {
    icon: string;
    title: string;
    subtitle: string;
}

export interface TourReview {
    id: number;
    rating: number;
    body: string;
    author_name: string;
    author_avatar?: string;
    location_label?: string;
    year?: number;
}

export interface Tour {
    id: number;
    tax_fee: number;
    slug: string;
    title: string;
    excerpt: string;
    description: string;
    type: 'tour' | 'package';
    base_price: number;
    child_price: number | null;
    currency: string;
    duration_days: number;
    flexible_dates?: boolean;
    max_group_size: number;
    style: string;
    rating_cache: number;
    reviews_count_cache: number;
    badge: string | null;
    discount_percent: number;
    status: string;
    cancellation_days: number;
    deposit_percent: number;
    difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme' | null;
    min_age: number | null;
    languages: string[];
    practical_info: string | null;
    destination: Destination;
    inclusions: { type: string; icon?: string }[];
    highlights: TourHighlight[];
    included: string[];
    excluded: string[];
    itinerary: ItineraryDay[];
    gallery: MediaItem[];
    hero_url: string;
    card_url: string;
    thumb_url: string;
    addons: TourAddon[];
    schedules: TourSchedule[];
    reviews: TourReview[];
    is_wishlisted?: boolean;
    seats_left?: number;
    booked_this_week?: number;
}

export interface Destination {
    id: number;
    name: string;
    country: string;
    slug: string;
}

export interface MediaItem {
    id: number;
    url: string;
    thumb_url: string;
    card_url: string;
    hero_url: string;
}

export interface ItineraryDay {
    day: number;
    title: string;
    description: string;
    location?: string;
    meals?: string;
}

export interface TourAddon {
    id: number;
    name: string;
    price: number;
    per: 'person' | 'group';
    description?: string;
}

export interface TourSchedule {
    id: number;
    start_date: string;
    end_date: string;
    capacity: number;
    seats_left: number;
    price_override?: number;
}

export interface Booking {
    id: number;
    reference: string;
    tour: Tour;
    schedule: TourSchedule;
    travelers_count: number;
    lead_name: string;
    lead_email: string;
    total_amount: number;
    deposit_amount: number;
    balance_amount: number;
    status: string;
    paid_at?: string;
    addons?: BookingAddon[];
    travelers?: Traveler[];
    cancellation_deadline?: string | null;
    can_cancel?: boolean;
}

export interface BookingAddon {
    addon: TourAddon;
    quantity: number;
    total: number;
}

export interface Traveler {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    country_of_origin?: string;
    passport_number?: string;
    is_lead: boolean;
}

export interface User {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email: string;
    avatar?: string;
    tier?: string;
    member_since?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface AppSettings {
    tax_fee_percent: number;
    tier_discount_percent: number;
    deposit_percent: number;
}

export interface PageProps {
    [key: string]: unknown;
    auth: { user: User | null };
    locale: string;
    flash?: { success?: string; error?: string };
    stripe_key?: string;
    experiences?: string[];
    searchData?: {
        destinations: { name: string; country: string; slug: string }[];
        experiences: string[];
        availableDates: string[];
    };
    settings: AppSettings;
}
