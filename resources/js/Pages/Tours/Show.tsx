import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import {
    MapPin, Clock, Users, Star, Check, X,
    CheckCircle2, AlertTriangle, Heart,
    Utensils, Tent, User, Camera, Shield, Binoculars, Sparkles, Wind,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourHighlight, TourReview, PageProps } from '../../types';

interface Props { tour: Tour & { user_has_reviewed?: boolean } }

// ── Icon map for highlight cards ──────────────────────────────────────────────
const ICON_MAP: Record<string, { icon: React.ReactNode; bg: string }> = {
    user:        { icon: <User size={18} />,       bg: 'bg-[#2E4A39]' },
    tent:        { icon: <Tent size={18} />,       bg: 'bg-[#c97b4b]' },
    utensils:    { icon: <Utensils size={18} />,   bg: 'bg-[#2E4A39]' },
    balloon:     { icon: <Wind size={18} />,       bg: 'bg-[#5a7a5e]' },
    binoculars:  { icon: <Binoculars size={18} />, bg: 'bg-[#2E4A39]' },
    camera:      { icon: <Camera size={18} />,     bg: 'bg-[#c97b4b]' },
    shield:      { icon: <Shield size={18} />,     bg: 'bg-[#2E4A39]' },
    star:        { icon: <Sparkles size={18} />,   bg: 'bg-[#5a7a5e]' },
};

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ── Stars component ───────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-[2px]">
            {[1, 2, 3, 4, 5].map(n => (
                <Star
                    key={n}
                    size={size}
                    className={n <= Math.round(rating) ? 'fill-[#E07A3F] text-[#E07A3F]' : 'text-[#e4ddd0]'}
                />
            ))}
        </div>
    );
}

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const colors   = ['bg-[#2E4A39]', 'bg-[#c97b4b]', 'bg-[#5a7a5e]', 'bg-[#8B5E3C]'];
    const bg       = colors[name.charCodeAt(0) % colors.length];
    if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover" />;
    return (
        <div style={{ width: size, height: size }} className={`${bg} rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0`}>
            {initials}
        </div>
    );
}

export default function TourShow({ tour }: Props) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';
    const [activeTab, setActiveTab]               = useState('overview');
    const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(tour.schedules?.[0] ?? null);
    const [travelers, setTravelers]               = useState(2);
    const [payFull, setPayFull]                   = useState(false);
    const [wishlisted, setWishlisted]             = useState(tour.is_wishlisted ?? false);
    const tabsRef = useRef<HTMLDivElement>(null);
    const sectionRefs = {
        overview:  useRef<HTMLDivElement>(null),
        itinerary: useRef<HTMLDivElement>(null),
        included:  useRef<HTMLDivElement>(null),
        reviews:   useRef<HTMLDivElement>(null),
    };

    const pricePerPerson = selectedSchedule?.price_override ?? tour.base_price;
    const subtotal       = pricePerPerson * travelers;
    const memberDiscount = auth.user ? Math.round(subtotal * 0.05) : 0;
    const taxes          = Math.round((subtotal - memberDiscount) * 0.008);
    const total          = subtotal - memberDiscount + taxes;
    const fullSaving     = Math.round(total * 0.02);

    const cancellationDate = selectedSchedule
        ? new Date(new Date(selectedSchedule.start_date).getTime() - (tour.cancellation_days ?? 30) * 86400000)
              .toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    const TABS = [
        { id: 'overview',  label: t('show.tab_overview') },
        { id: 'itinerary', label: t('show.tab_itinerary') },
        { id: 'included',  label: t('show.tab_included') },
        { id: 'reviews',   label: t('show.tab_reviews') },
    ];

    // Scroll-spy: highlight active tab as user scrolls
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => { entries.forEach(e => { if (e.isIntersecting) setActiveTab(e.target.id); }); },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );
        Object.values(sectionRefs).forEach(ref => { if (ref.current) observer.observe(ref.current); });
        return () => observer.disconnect();
    }, []);

    function scrollTo(id: string) {
        sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab(id);
    }

    function handleReserve() {
        router.post('/booking/start', { tour_id: tour.id, travelers, pay_full: payFull });
    }

    function handleWishlist() {
        if (!auth.user) { router.visit('/login'); return; }
        router.post(`/wishlist/${tour.id}`, {}, { preserveScroll: true, preserveState: true });
        setWishlisted(!wishlisted);
    }

    const highlights: TourHighlight[] = Array.isArray(tour.highlights) ? tour.highlights : [];
    const reviews: TourReview[]       = Array.isArray(tour.reviews) ? tour.reviews : [];
    const itinerary                   = Array.isArray(tour.itinerary) ? tour.itinerary : [];
    const included                    = Array.isArray(tour.included) ? tour.included : [];
    const excluded                    = Array.isArray(tour.excluded) ? tour.excluded : [];

    return (
        <AppLayout>
            <Head title={typeof tour.title === 'string' ? tour.title : 'Tour'} />

            {/* ── Gallery ─────────────────────────────────────────────────── */}
            <div className="bg-[#f5f2ec]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 pt-[16px] pb-[0px]">
                    {(tour.gallery?.length ?? 0) > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px] h-[240px] sm:h-[380px] rounded-t-[20px] overflow-hidden">
                            <div className="col-span-1 sm:col-span-2 relative overflow-hidden">
                                <img
                                    src={tour.hero_url || tour.gallery[0]?.url || '/images/placeholder-safari.jpg'}
                                    alt={typeof tour.title === 'string' ? tour.title : ''}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={handleWishlist}
                                    className="absolute top-[16px] right-[16px] w-[40px] h-[40px] rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                                >
                                    <Heart size={18} className={wishlisted ? 'fill-[#E07A3F] text-[#E07A3F]' : 'text-[#8a968d]'} />
                                </button>
                            </div>
                            <div className="hidden sm:flex flex-col gap-[8px]">
                                {tour.gallery.slice(1, 3).map((img, i) => (
                                    <div key={i} className="flex-1 overflow-hidden">
                                        <img src={img.card_url || img.url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {tour.gallery.length < 2 && <div className="flex-1 bg-[#e4ddd0] rounded" />}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[240px] sm:h-[380px] rounded-t-[20px] bg-[#e4ddd0] flex items-center justify-center">
                            <Camera size={48} className="text-[#8a968d] opacity-30" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────────── */}
            <div className="bg-white min-h-screen">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[56px] items-start">

                        {/* ── Left column ─────────────────────────────────── */}
                        <div className="flex-1 min-w-0 pb-[80px]">

                            {/* Title + meta ─────────────────────────────── */}
                            <div className="pt-[32px] pb-[24px]">
                                {tour.badge && (
                                    <span className="inline-block px-[10px] py-[3px] rounded-full bg-[#E07A3F] text-white text-[11px] font-bold tracking-[1.5px] uppercase mb-[12px]">
                                        {tour.badge}
                                    </span>
                                )}
                                <h1 className="font-display not-italic text-[38px] leading-[1.1] text-[#16241b] mb-[10px]">
                                    {typeof tour.title === 'string' ? tour.title : ''}
                                </h1>

                                <div className="flex items-center flex-wrap gap-x-[16px] gap-y-[6px] text-[14px]">
                                    {(tour.rating_cache ?? 0) > 0 && (
                                        <div className="flex items-center gap-[6px]">
                                            <Stars rating={tour.rating_cache} />
                                            <span className="font-semibold text-[#16241b]">{tour.rating_cache?.toFixed(1)}</span>
                                            <span className="text-[#8a968d]">
                                                · {t('show.reviews_count', { count: tour.reviews_count_cache?.toLocaleString() ?? '0' })}
                                            </span>
                                        </div>
                                    )}
                                    {tour.destination && (
                                        <div className="flex items-center gap-[5px] text-[#8a968d]">
                                            <MapPin size={13} />
                                            <span>{tour.destination.name}, {tour.destination.country}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-[5px] text-[#8a968d]">
                                        <Clock size={13} />
                                        <span>{t('show.days_label', { count: tour.duration_days })}</span>
                                    </div>
                                    <div className="flex items-center gap-[5px] text-[#8a968d]">
                                        <Users size={13} />
                                        <span>{t('show.max_group', { count: tour.max_group_size })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky tab nav ────────────────────────────── */}
                            <div
                                ref={tabsRef}
                                className="sticky top-0 z-20 bg-white border-b border-[#e4ddd0] -mx-[100px] max-lg:-mx-6 px-[100px] max-lg:px-6"
                            >
                                <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => scrollTo(tab.id)}
                                            className={`px-[20px] py-[16px] text-[14px] font-medium whitespace-nowrap border-b-[2.5px] transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-[#2E4A39] text-[#2E4A39]'
                                                    : 'border-transparent text-[#8a968d] hover:text-[#16241b]'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Overview section ────────────────────── */}
                            <div id="overview" ref={sectionRefs.overview} className="pt-[40px]">
                                <h2 className="font-display not-italic text-[24px] text-[#16241b] mb-[16px]">
                                    {tour.type === 'package' ? t('show.about_package') : t('show.about_safari')}
                                </h2>

                                {tour.description && (
                                    <div
                                        className="text-[15px] text-[#4f5c53] leading-[1.75] [&_p]:mb-[14px] [&_h2]:text-[#16241b] [&_h2]:font-bold [&_h3]:text-[#16241b] [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4"
                                        dangerouslySetInnerHTML={{ __html: typeof tour.description === 'string' ? tour.description : '' }}
                                    />
                                )}

                                {/* Feature highlight cards ────────────────── */}
                                {highlights.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mt-[28px]">
                                        {highlights.map((h, i) => {
                                            const mapped = ICON_MAP[h.icon] ?? { icon: <CheckCircle2 size={18} />, bg: 'bg-[#2E4A39]' };
                                            return (
                                                <div key={i} className="flex items-center gap-[16px] bg-[#f7f5f0] rounded-[14px] p-[16px] border border-[#ede9e2]">
                                                    <div className={`w-[44px] h-[44px] rounded-full ${mapped.bg} flex items-center justify-center text-white shrink-0`}>
                                                        {mapped.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[#16241b] leading-[1.3]">{h.title}</p>
                                                        {h.subtitle && <p className="text-[12px] text-[#8a968d] mt-[2px]">{h.subtitle}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Itinerary section ───────────────────── */}
                            <div id="itinerary" ref={sectionRefs.itinerary} className="pt-[56px]">
                                <h2 className="font-display not-italic text-[24px] text-[#16241b] mb-[28px]">
                                    {t('show.itinerary_title')}
                                </h2>

                                {itinerary.length > 0 ? (
                                    <div className="relative">
                                        <div className="absolute left-[17px] top-[36px] bottom-[36px] w-[2px] bg-[#e4ddd0]" />
                                        <div className="space-y-[28px]">
                                            {itinerary.map((day: any, i: number) => (
                                                <div key={i} className="flex gap-[20px]">
                                                    <div className="relative shrink-0">
                                                        <div className="w-[36px] h-[36px] rounded-full bg-[#2E4A39] text-white text-[13px] font-bold flex items-center justify-center relative z-10">
                                                            {day.day}
                                                        </div>
                                                    </div>
                                                    <div className="pb-[4px]">
                                                        <p className="text-[15px] font-bold text-[#16241b] mb-[6px] leading-[1.3]">
                                                            {day.title}
                                                        </p>
                                                        {(day.location || day.meals) && (
                                                            <div className="flex items-center flex-wrap gap-x-[12px] gap-y-[2px] mb-[8px]">
                                                                {day.location && (
                                                                    <span className="flex items-center gap-[4px] text-[12px] text-[#8a968d]">
                                                                        <MapPin size={10} />
                                                                        {day.location}
                                                                    </span>
                                                                )}
                                                                {day.meals && (
                                                                    <span className="flex items-center gap-[4px] text-[12px] text-[#8a968d]">
                                                                        <Utensils size={10} />
                                                                        {t('show.meals', { meals: day.meals })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className="text-[14px] text-[#4f5c53] leading-[1.65]">
                                                            {day.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[14px] text-[#8a968d]">{t('show.no_itinerary')}</p>
                                )}
                            </div>

                            {/* ── What's included section ─────────────── */}
                            <div id="included" ref={sectionRefs.included} className="pt-[56px]">
                                <h2 className="font-display not-italic text-[24px] text-[#16241b] mb-[28px]">
                                    {t('show.whats_included')}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                                    <div>
                                        <p className="text-[12px] font-bold text-[#16241b] uppercase tracking-[0.8px] mb-[16px]">
                                            {t('show.included_col')}
                                        </p>
                                        <ul className="space-y-[10px]">
                                            {included.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-[10px] text-[14px] text-[#4f5c53]">
                                                    <Check size={14} className="text-[#2E4A39] mt-[3px] shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-bold text-[#16241b] uppercase tracking-[0.8px] mb-[16px]">
                                            {t('show.excluded_col')}
                                        </p>
                                        <ul className="space-y-[10px]">
                                            {excluded.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-[10px] text-[14px] text-[#8a968d]">
                                                    <X size={14} className="text-[#E07A3F] mt-[3px] shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* ── Traveler reviews section ────────────── */}
                            <div id="reviews" ref={sectionRefs.reviews} className="pt-[56px]">
                                <div className="flex items-center justify-between flex-wrap gap-[10px] mb-[28px]">
                                    <h2 className="font-display not-italic text-[24px] text-[#16241b]">
                                        {t('show.reviews_title')}
                                    </h2>
                                    {(tour.rating_cache ?? 0) > 0 && (
                                        <div className="flex items-center gap-[10px]">
                                            <span className="font-display not-italic text-[40px] text-[#16241b] leading-none">
                                                {tour.rating_cache?.toFixed(1)}
                                            </span>
                                            <div>
                                                <Stars rating={tour.rating_cache} size={16} />
                                                <p className="text-[12px] text-[#8a968d] mt-[2px]">
                                                    {t('show.reviews_count', { count: tour.reviews_count_cache?.toLocaleString() ?? '0' })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {reviews.length > 0 ? (
                                    <div className="space-y-[16px]">
                                        {reviews.map(rev => (
                                            <div key={rev.id} className="bg-white border border-[#e4ddd0] rounded-[16px] p-[24px]">
                                                <Stars rating={rev.rating} />
                                                <blockquote className="mt-[14px] mb-[20px] text-[15px] text-[#16241b] leading-[1.65] italic font-medium">
                                                    {rev.body}
                                                </blockquote>
                                                <div className="flex items-center gap-[12px]">
                                                    <Avatar name={rev.author_name} src={rev.author_avatar} size={44} />
                                                    <div>
                                                        <p className="text-[14px] font-bold text-[#16241b]">{rev.author_name}</p>
                                                        {rev.location_label && (
                                                            <p className="text-[12px] text-[#8a968d] mt-[1px]">{rev.location_label}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-[48px] border border-dashed border-[#e4ddd0] rounded-[16px]">
                                        <Star size={28} className="mx-auto text-[#e4ddd0] mb-[10px]" />
                                        <p className="text-[14px] text-[#8a968d]">{t('show.no_reviews')}</p>
                                    </div>
                                )}

                                {/* ── Submit a review ── */}
                                <ReviewForm
                                    tourSlug={tour.slug}
                                    userHasReviewed={!!tour.user_has_reviewed}
                                />
                            </div>
                        </div>

                        {/* ── Right: sticky booking widget ────────────── */}
                        <div className="w-full lg:w-[380px] shrink-0 lg:sticky top-[24px] pb-[40px] lg:pt-[32px] lg:pb-[80px]">
                            <div className="bg-white rounded-[20px] border border-[#e4ddd0] overflow-hidden shadow-sm">

                                {/* Price header */}
                                <div className="bg-[#2E4A39] px-[24px] py-[20px]">
                                    {tour.discount_percent && tour.discount_percent > 0 ? (
                                        <p className="text-[12px] text-white/50 line-through mb-[2px]">{fmt(tour.base_price)}</p>
                                    ) : (
                                        <p className="text-[12px] text-white/60 mb-[2px]">{t('show.price_from')}</p>
                                    )}
                                    <div className="flex items-baseline gap-[4px]">
                                        <span className="font-display not-italic text-[28px] text-white leading-none">
                                            {fmt(pricePerPerson)}
                                        </span>
                                        <span className="text-[13px] text-white/60">{t('show.per_person')}</span>
                                    </div>
                                    {tour.seats_left !== undefined && tour.seats_left > 0 && tour.seats_left <= 5 && (
                                        <p className="flex items-center gap-[5px] text-[11px] text-[#f0a05e] mt-[8px]">
                                            <AlertTriangle size={11} />
                                            {t('show.seats_left', { count: tour.seats_left })}
                                        </p>
                                    )}
                                </div>

                                <div className="p-[20px] space-y-[14px]">
                                    {/* Departure date */}
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[6px]">
                                            {t('show.departure')}
                                        </label>
                                        <select
                                            value={selectedSchedule?.id ?? ''}
                                            onChange={e => setSelectedSchedule(tour.schedules?.find(s => s.id === Number(e.target.value)) ?? null)}
                                            className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] text-[#16241b] bg-[#fbf8f2] focus:outline-none focus:border-[#2E4A39]"
                                        >
                                            <option value="">{t('show.select_date')}</option>
                                            {tour.schedules?.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {new Date(s.start_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} –{' '}
                                                    {new Date(s.end_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    {s.seats_left <= 5 ? ` ${t('show.n_left', { count: s.seats_left })}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Travelers */}
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[6px]">
                                            {t('show.travelers_label')}
                                        </label>
                                        <select
                                            value={travelers}
                                            onChange={e => setTravelers(Number(e.target.value))}
                                            className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] text-[#16241b] bg-[#fbf8f2] focus:outline-none focus:border-[#2E4A39]"
                                        >
                                            {Array.from({ length: tour.max_group_size }, (_, i) => i + 1).map(n => (
                                                <option key={n} value={n}>
                                                    {n} {n === 1 ? t('show.adult_singular') : t('show.adults_plural')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price breakdown */}
                                    <div className="pt-[2px] border-t border-[#f0ede8] space-y-[8px]">
                                        <WidgetLine
                                            label={`${fmt(pricePerPerson)} × ${travelers} ${travelers === 1 ? t('show.adult_singular') : t('show.adults_plural')}`}
                                            value={fmt(subtotal)}
                                        />
                                        {memberDiscount > 0 && (
                                            <WidgetLine label={t('show.member_discount')} value={`–${fmt(memberDiscount)}`} accent />
                                        )}
                                        <WidgetLine label={t('show.taxes')} value={fmt(taxes)} />
                                        <div className="flex justify-between items-center pt-[8px] border-t border-[#e4ddd0]">
                                            <span className="text-[14px] font-bold text-[#16241b]">{t('show.total')}</span>
                                            <span className="text-[20px] font-bold text-[#16241b]">{fmt(total)}</span>
                                        </div>
                                    </div>

                                    {/* Free cancellation */}
                                    {cancellationDate && (
                                        <div className="flex items-start gap-[8px] bg-[#eef3ec] rounded-[12px] px-[12px] py-[10px]">
                                            <CheckCircle2 size={13} className="text-[#2E4A39] mt-[1px] shrink-0" />
                                            <p className="text-[12px] text-[#2E4A39] font-medium leading-[1.4]">
                                                {t('show.free_cancel', { date: cancellationDate })}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reserve CTA */}
                                    <button
                                        onClick={() => { setPayFull(false); handleReserve(); }}
                                        className="w-full py-[15px] rounded-full bg-[#2E4A39] text-white text-[14px] font-semibold hover:bg-[#1e3326] transition-colors"
                                    >
                                        {t('show.reserve_deposit')}
                                    </button>

                                    {/* Pay in full */}
                                    <button
                                        onClick={() => { setPayFull(true); handleReserve(); }}
                                        className="w-full py-[8px] text-[13px] font-medium text-[#2E4A39] hover:underline"
                                    >
                                        {t('show.pay_full', { amount: fmt(fullSaving) })}
                                    </button>

                                    <p className="text-center text-[11px] text-[#8a968d]">
                                        {t('show.no_charge')}
                                    </p>

                                    {/* Trust badges */}
                                    <div className="pt-[8px] border-t border-[#f0ede8] space-y-[8px]">
                                        {[
                                            { icon: <Shield size={13} />,       text: t('show.trust_bonded') },
                                            { icon: <Clock size={13} />,         text: t('show.trust_reply') },
                                            { icon: <CheckCircle2 size={13} />, text: t('show.trust_carbon') },
                                        ].map((b, i) => (
                                            <div key={i} className="flex items-center gap-[8px] text-[12px] text-[#4f5c53]">
                                                <span className="text-[#2E4A39]">{b.icon}</span>
                                                {b.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// ── Review form ──────────────────────────────────────────────────────────────
function ReviewForm({ tourSlug, userHasReviewed }: { tourSlug: string; userHasReviewed: boolean }) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const [hovered, setHovered] = useState(0);
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
        rating: 0,
        body: '',
    });

    if (!auth?.user) {
        return (
            <div className="mt-[32px] bg-[#fbf8f2] border border-[#e4ddd0] rounded-[16px] p-[24px] text-center">
                <Star size={24} className="mx-auto text-[#E07A3F] mb-[10px]" />
                <p className="text-[15px] font-semibold text-[#16241b] mb-[6px]">{t('review.share_exp')}</p>
                <p className="text-[13px] text-[#8a968d] mb-[16px]">{t('review.sign_in_prompt')}</p>
                <Link
                    href={`/${locale}/login`}
                    className="inline-block px-[20px] py-[10px] rounded-full bg-[#2E4A39] text-white text-[13px] font-semibold hover:bg-[#3a5c4a] transition-colors"
                >
                    {t('review.sign_in_btn')}
                </Link>
            </div>
        );
    }

    if (userHasReviewed) {
        return (
            <div className="mt-[32px] bg-[#f0f7f2] border border-[#b8d4be] rounded-[16px] p-[20px] flex items-center gap-[14px]">
                <CheckCircle2 size={22} className="text-[#2E4A39] shrink-0" />
                <div>
                    <p className="text-[14px] font-semibold text-[#16241b]">{t('review.already_reviewed')}</p>
                    <p className="text-[12px] text-[#8a968d] mt-[2px]">{t('review.thanks_feedback')}</p>
                </div>
            </div>
        );
    }

    if (wasSuccessful) {
        return (
            <div className="mt-[32px] bg-[#f0f7f2] border border-[#b8d4be] rounded-[16px] p-[20px] flex items-center gap-[14px]">
                <CheckCircle2 size={22} className="text-[#2E4A39] shrink-0" />
                <div>
                    <p className="text-[14px] font-semibold text-[#16241b]">{t('review.submitted')}</p>
                    <p className="text-[12px] text-[#8a968d] mt-[2px]">{t('review.after_moderation')}</p>
                </div>
            </div>
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/${locale}/tours/${tourSlug}/reviews`, { onSuccess: () => reset() });
    }

    return (
        <div className="mt-[32px] bg-white border border-[#e4ddd0] rounded-[16px] p-[24px]">
            <h3 className="text-[16px] font-bold text-[#16241b] mb-[18px]">{t('review.write')}</h3>
            <form onSubmit={handleSubmit}>
                {/* Star selector */}
                <div className="mb-[16px]">
                    <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#8a968d] mb-[8px]">{t('review.your_rating')}</p>
                    <div className="flex items-center gap-[4px]">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                type="button"
                                onMouseEnter={() => setHovered(n)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setData('rating', n)}
                                className="p-[2px] focus:outline-none"
                            >
                                <Star
                                    size={28}
                                    className={
                                        n <= (hovered || data.rating)
                                            ? 'fill-[#E07A3F] text-[#E07A3F] transition-colors'
                                            : 'text-[#e4ddd0] transition-colors'
                                    }
                                />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="text-[12px] text-red-500 mt-[4px]">{errors.rating}</p>}
                </div>

                {/* Body */}
                <div className="mb-[18px]">
                    <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#8a968d] mb-[8px]">{t('review.your_exp')}</p>
                    <textarea
                        value={data.body}
                        onChange={e => setData('body', e.target.value)}
                        rows={4}
                        placeholder={t('review.placeholder')}
                        className="w-full px-[14px] py-[12px] rounded-[12px] border border-[#e4ddd0] text-[14px] text-[#16241b] bg-[#fbf8f2] resize-none focus:outline-none focus:border-[#2E4A39] placeholder:text-[#b0b8b2]"
                    />
                    {errors.body && <p className="text-[12px] text-red-500 mt-[4px]">{errors.body}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing || data.rating === 0 || data.body.length < 20}
                    className="px-[24px] py-[11px] rounded-full bg-[#2E4A39] text-white text-[13px] font-semibold hover:bg-[#3a5c4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? t('review.submitting') : t('review.submit')}
                </button>
            </form>
        </div>
    );
}

// ── Widget price line ────────────────────────────────────────────────────────
function WidgetLine({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="flex justify-between text-[13px]">
            <span className={accent ? 'text-[#E07A3F]' : 'text-[#8a968d]'}>{label}</span>
            <span className={accent ? 'text-[#E07A3F] font-medium' : 'text-[#16241b]'}>{value}</span>
        </div>
    );
}
