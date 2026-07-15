import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import {
    MapPin, Clock, Users, Star, Check, X,
    CheckCircle2, AlertTriangle, Heart,
    Utensils, Tent, User, Camera, Shield, Binoculars, Sparkles, Wind,
    ChevronLeft, ChevronRight, LayoutGrid, Globe, Activity,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourHighlight, TourReview, PageProps, MediaItem } from '../../types';
import { csrfToken } from '../../utils';

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
    const { auth, locale, settings } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';
    const [activeTab, setActiveTab]               = useState('overview');
    const flexibleDates = !!tour.flexible_dates;
    const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(flexibleDates ? null : tour.schedules?.[0] ?? null);
    const [customDate, setCustomDate]             = useState('');
    const [travelers, setTravelers]               = useState(2);
    const [payFull, setPayFull]                   = useState(false);
    const [wishlisted, setWishlisted]             = useState(tour.is_wishlisted ?? false);
    const [lightboxOpen, setLightboxOpen]          = useState(false);
    const [lightboxIndex, setLightboxIndex]        = useState(0);
    const tabsRef = useRef<HTMLDivElement>(null);
    const sectionRefs = {
        overview:  useRef<HTMLDivElement>(null),
        itinerary: useRef<HTMLDivElement>(null),
        included:  useRef<HTMLDivElement>(null),
        reviews:   useRef<HTMLDivElement>(null),
    };

    const basePrice      = selectedSchedule?.price_override ?? tour.base_price;
    const tourDiscPct    = tour.discount_percent ?? 0;
    const pricePerPerson = Math.round(basePrice * (1 - tourDiscPct / 100));
    const subtotal       = pricePerPerson * travelers;
    const tierDiscPct    = settings.tier_discount_percent;
    const memberDiscount = auth.user ? Math.round(subtotal * tierDiscPct / 100) : 0;
    const taxPct         = settings.tax_fee_percent;
    const taxes          = Math.round((subtotal - memberDiscount) * taxPct / 100);
    const total          = subtotal - memberDiscount + taxes;
    const fullSaving     = Math.round(total * 0.02);
    const depositPct     = tour.deposit_percent ?? settings.deposit_percent;
    const depositAmount  = Math.round(total * depositPct / 100);

    const departureDate = selectedSchedule?.start_date ?? (customDate || null);
    const cancellationDate = departureDate
        ? new Date(new Date(departureDate).getTime() - (tour.cancellation_days ?? 30) * 86400000)
              .toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    // Earliest client-picked departure: 2 days from now (matches backend rule)
    const minCustomDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    const TABS = [
        { id: 'overview',  label: t('show.tab_overview') },
        ...((Array.isArray(tour.itinerary) && (tour.itinerary as any[]).length > 0)
            ? [{ id: 'itinerary', label: t('show.tab_itinerary') }] : []),
        ...((Array.isArray(tour.included) && (tour.included as any[]).length > 0) ||
            (Array.isArray(tour.excluded) && (tour.excluded as any[]).length > 0)
            ? [{ id: 'included', label: t('show.tab_included') }] : []),
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
        router.post('/booking/start', {
            tour_id: tour.id,
            travelers,
            pay_full: payFull,
            schedule_id: selectedSchedule?.id ?? undefined,
            custom_date: !selectedSchedule && customDate ? customDate : undefined,
        });
    }

    function handleWishlist() {
        if (!auth.user) { router.visit('/login'); return; }
        const next = !wishlisted;
        setWishlisted(next);
        fetch(`/wishlist/${tour.id}`, {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        }).catch(() => setWishlisted(!next));
    }

    function openLightbox(index: number) {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }

    const highlights: TourHighlight[] = Array.isArray(tour.highlights) ? tour.highlights : [];
    const reviews: TourReview[]       = Array.isArray(tour.reviews) ? tour.reviews : [];
    const itinerary                   = Array.isArray(tour.itinerary) ? tour.itinerary : [];
    const included                    = Array.isArray(tour.included) ? tour.included : [];
    const excluded                    = Array.isArray(tour.excluded) ? tour.excluded : [];
    const hasItinerary                = itinerary.length > 0;
    const hasIncluded                 = included.length > 0 || excluded.length > 0;

    return (
        <AppLayout>
            <Head title={typeof tour.title === 'string' ? tour.title : 'Tour'} />

            {/* ── Gallery ─────────────────────────────────────────────────── */}
            <div className="bg-[#f5f2ec]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 pt-[16px] pb-[0px]">
                    {(tour.gallery?.length ?? 0) > 0 ? (
                        <div className="relative">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px] h-[240px] sm:h-[380px] rounded-t-[20px] overflow-hidden">
                                {/* Main hero image */}
                                <div
                                    className="col-span-1 sm:col-span-2 relative overflow-hidden cursor-pointer group/hero"
                                    onClick={() => openLightbox(0)}
                                >
                                    <img
                                        src={tour.hero_url || tour.gallery[0]?.url}
                                        alt={typeof tour.title === 'string' ? tour.title : ''}
                                        className="w-full h-full object-cover group-hover/hero:scale-[1.02] transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/hero:bg-black/10 transition-colors duration-300" />
                                    <button
                                        onClick={e => { e.stopPropagation(); handleWishlist(); }}
                                        className="absolute top-[16px] right-[16px] w-[40px] h-[40px] rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow"
                                    >
                                        <Heart size={18} className={wishlisted ? 'fill-[#E07A3F] text-[#E07A3F]' : 'text-[#8a968d]'} />
                                    </button>
                                </div>

                                {/* Side thumbnails */}
                                <div className="hidden sm:flex flex-col gap-[8px]">
                                    {tour.gallery.slice(1, 3).map((img, i) => (
                                        <div
                                            key={img.id}
                                            className="flex-1 relative overflow-hidden cursor-pointer group/thumb"
                                            onClick={() => openLightbox(i + 1)}
                                        >
                                            <img
                                                src={img.card_url || img.url}
                                                alt=""
                                                className="w-full h-full object-cover group-hover/thumb:scale-[1.02] transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors duration-300" />
                                            {/* "+N more" overlay on last visible thumbnail */}
                                            {i === 1 && tour.gallery.length > 3 && (
                                                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-white text-[26px] font-bold leading-none">+{tour.gallery.length - 3}</span>
                                                    <span className="text-white/70 text-[11px] mt-[4px] font-medium tracking-wide">photos</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {tour.gallery.length < 2 && <div className="flex-1 bg-[#e4ddd0]" />}
                                </div>
                            </div>

                            {/* View all photos pill */}
                            {tour.gallery.length > 1 && (
                                <button
                                    onClick={() => openLightbox(0)}
                                    className="absolute bottom-[16px] right-[16px] flex items-center gap-[7px] bg-white/95 backdrop-blur-sm text-[#16241b] text-[12px] font-semibold px-[14px] py-[9px] rounded-full shadow-md hover:bg-white transition-colors"
                                >
                                    <LayoutGrid size={13} />
                                    {t('show.view_all_photos', { count: tour.gallery.length })}
                                </button>
                            )}
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
                                            <span>{typeof tour.destination.name === 'string' ? tour.destination.name : ''}{tour.destination.country ? `, ${tour.destination.country}` : ''}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-[5px] text-[#8a968d]">
                                        <Clock size={13} />
                                        <span>{t('show.days_label', { count: tour.duration_days ?? 0 })}</span>
                                    </div>
                                    {/* <div className="flex items-center gap-[5px] text-[#8a968d]">
                                        <Users size={13} />
                                        <span>{t('show.max_group', { count: tour.max_group_size ?? 0 })}</span>
                                    </div> */}
                                    {tour.difficulty && (
                                        <span className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[12px] font-medium ${{
                                            easy:        'bg-[#eef3ec] text-[#2E4A39]',
                                            moderate:    'bg-[#e8f0fe] text-[#1a56db]',
                                            challenging: 'bg-[#fff3e0] text-[#c97b4b]',
                                            extreme:     'bg-[#fde8e8] text-[#c81e1e]',
                                        }[tour.difficulty] ?? 'bg-[#f0ede8] text-[#6b7280]'}`}>
                                            <Activity size={11} />
                                            {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
                                        </span>
                                    )}
                                    {/* {tour.min_age != null && (
                                        <span className="text-[13px] text-[#8a968d]">
                                            Ages {tour.min_age}+
                                        </span>
                                    )} */}
                                </div>
                            </div>

                            {/* Sticky tab nav ────────────────────────────── */}
                            <div
                                ref={tabsRef}
                                className="sticky top-0 z-20 bg-white border-b border-[#e4ddd0]  max-lg:-mx-6 md:px-[10px] p-0 max-lg:px-6"
                            >
                                <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => scrollTo(tab.id)}
                                            className={`md:px-[20px] md:py-[16px] px-[11px] py-[8px] text-[14px] font-medium whitespace-nowrap border-b-[2.5px] transition-colors ${
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

                                {typeof tour.description === 'string' && tour.description.replace(/<[^>]*>/g, '').trim().length > 0 && (
                                    <div
                                        className="text-[15px] text-[#4f5c53] leading-[1.75] [&_p]:mb-[14px] [&_h2]:text-[#16241b] [&_h2]:font-bold [&_h3]:text-[#16241b] [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4"
                                        dangerouslySetInnerHTML={{ __html: tour.description }}
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

                                {/* Guide languages ─────────────────────────── */}
                                {Array.isArray(tour.languages) && tour.languages.length > 0 && (
                                    <div className="flex items-center gap-[10px] mt-[24px] bg-[#f7f5f0] rounded-[12px] px-[16px] py-[12px] border border-[#ede9e2]">
                                        <Globe size={15} className="text-[#6e8c79] shrink-0" />
                                        <p className="text-[13px] text-[#4f5c53]">
                                            <span className="font-semibold text-[#16241b]">Guide languages: </span>
                                            {tour.languages.join(' · ')}
                                        </p>
                                    </div>
                                )}

                                {/* Practical info ──────────────────────────── */}
                                {typeof tour.practical_info === 'string' && tour.practical_info.replace(/<[^>]*>/g, '').trim().length > 0 && (
                                    <div className="mt-[36px]">
                                        <h3 className="font-display not-italic text-[20px] text-[#16241b] mb-[14px]">
                                            Important Notes
                                        </h3>
                                        <div
                                            className="text-[14px] text-[#4f5c53] leading-[1.75] bg-[#fffbf5] border border-[#ede9e2] rounded-[14px] px-[20px] py-[18px] [&_p]:mb-[10px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3"
                                            dangerouslySetInnerHTML={{ __html: tour.practical_info }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* ── Itinerary section ───────────────────── */}
                            {hasItinerary && (
                            <div id="itinerary" ref={sectionRefs.itinerary} className="pt-[56px]">
                                <h2 className="font-display not-italic text-[24px] text-[#16241b] mb-[28px]">
                                    {t('show.itinerary_title')}
                                </h2>
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
                            </div>
                            )}

                            {/* ── What's included section ─────────────── */}
                            {hasIncluded && (
                            <div id="included" ref={sectionRefs.included} className="pt-[56px]">
                                <h2 className="font-display not-italic text-[24px] text-[#16241b] mb-[28px]">
                                    {t('show.whats_included')}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                                    {included.length > 0 && (
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
                                    )}

                                    {excluded.length > 0 && (
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
                                    )}
                                </div>
                            </div>
                            )}

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
                                    {tour.seats_left != null && tour.seats_left > 0 && tour.seats_left <= 5 && (
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

                                        {flexibleDates && (
                                            <input
                                                type="date"
                                                min={minCustomDate}
                                                value={customDate}
                                                onChange={e => {
                                                    setCustomDate(e.target.value);
                                                    setSelectedSchedule(null);
                                                }}
                                                className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] text-[#16241b] bg-[#fbf8f2] focus:outline-none focus:border-[#2E4A39]"
                                            />
                                        )}

                                        {flexibleDates && customDate && !selectedSchedule && (
                                            <p className="text-[11px] text-[#6e8c79] mt-[6px]">
                                                {t('show.custom_date_note', {
                                                    end: new Date(new Date(customDate + 'T00:00:00').getTime() + Math.max(0, (tour.duration_days ?? 1) - 1) * 86400000)
                                                        .toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' }),
                                                })}
                                            </p>
                                        )}

                                        {(tour.schedules?.length ?? 0) > 0 && (
                                            <>
                                                {flexibleDates && (
                                                    <p className="text-[11px] text-[#8a968d] mt-[10px] mb-[6px]">
                                                        {t('show.or_group_departure')}
                                                    </p>
                                                )}
                                                <select
                                                    value={selectedSchedule?.id ?? ''}
                                                    onChange={e => {
                                                        const schedule = tour.schedules?.find(s => s.id === Number(e.target.value)) ?? null;
                                                        setSelectedSchedule(schedule);
                                                        if (schedule) setCustomDate('');
                                                    }}
                                                    className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] text-[#16241b] bg-[#fbf8f2] focus:outline-none focus:border-[#2E4A39]"
                                                >
                                                    <option value="">{t('show.select_date')}</option>
                                                    {tour.schedules?.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {new Date(s.start_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} –{' '}
                                                            {new Date(s.end_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {s.seats_left != null && s.seats_left <= 5 ? ` ${t('show.n_left', { count: s.seats_left })}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}
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
                                        {!payFull && (
                                            <div className="flex justify-between items-center bg-[#eef3ec] rounded-[10px] px-[12px] py-[9px]">
                                                <span className="text-[12px] font-medium text-[#2E4A39]">
                                                    Deposit today ({depositPct}%)
                                                </span>
                                                <span className="text-[14px] font-bold text-[#2E4A39]">
                                                    {fmt(depositAmount)}
                                                </span>
                                            </div>
                                        )}
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
            {lightboxOpen && tour.gallery.length > 0 && (
                <GalleryLightbox
                    images={tour.gallery}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </AppLayout>
    );
}

// ── Gallery lightbox ─────────────────────────────────────────────────────────
function GalleryLightbox({
    images,
    initialIndex,
    onClose,
}: {
    images: MediaItem[];
    initialIndex: number;
    onClose: () => void;
}) {
    const [index, setIndex] = useState(initialIndex);
    const thumbsRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
        }
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [prev, next, onClose]);

    // Keep active thumbnail in view
    useEffect(() => {
        const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [index]);

    function onTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e: React.TouchEvent) {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
        touchStartX.current = null;
    }

    const current = images[index];

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col bg-black/96"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
                <span className="text-white/50 text-[13px] tabular-nums">
                    {index + 1} <span className="text-white/30">/</span> {images.length}
                </span>
                <button
                    onClick={onClose}
                    className="w-[38px] h-[38px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <X size={18} className="text-white" />
                </button>
            </div>

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center relative min-h-0 px-14 py-2">
                <button
                    onClick={prev}
                    className="absolute left-3 w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 shrink-0"
                    aria-label="Previous"
                >
                    <ChevronLeft size={22} className="text-white" />
                </button>

                <img
                    key={current.url}
                    src={current.hero_url || current.url}
                    alt=""
                    className="max-w-full max-h-full object-contain rounded-[6px] select-none"
                    draggable={false}
                />

                <button
                    onClick={next}
                    className="absolute right-3 w-[44px] h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 shrink-0"
                    aria-label="Next"
                >
                    <ChevronRight size={22} className="text-white" />
                </button>
            </div>

            {/* Thumbnail strip */}
            <div
                ref={thumbsRef}
                className="flex gap-[6px] px-5 pb-5 pt-3 overflow-x-auto scrollbar-hide shrink-0 justify-start"
            >
                {images.map((img, i) => (
                    <button
                        key={img.id}
                        onClick={() => setIndex(i)}
                        className={`shrink-0 w-[64px] h-[46px] rounded-[6px] overflow-hidden transition-all duration-200 ${
                            i === index
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-black opacity-100'
                                : 'opacity-40 hover:opacity-70'
                        }`}
                    >
                        <img src={img.thumb_url || img.url} alt="" className="w-full h-full object-cover" draggable={false} />
                    </button>
                ))}
            </div>
        </div>
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
