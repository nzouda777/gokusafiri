import { Heart, MapPin, Star, Zap } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, PageProps } from '../types';
import { csrfToken } from '../utils';

interface Props {
    tour: Tour;
    onWishlistToggle?: (id: number) => void;
}

export default function TourCard({ tour, onWishlistToggle }: Props) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const [isWishlisted, setIsWishlisted] = useState(tour.is_wishlisted ?? false);

    const price = Math.round(tour.base_price / 100).toLocaleString('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    });

    const badge = tour.discount_percent > 0 ? `${tour.discount_percent}% OFF` : tour.badge;
    const badgeBg = badge === 'NEW' ? 'bg-white text-[#16241b]' : 'bg-[#f0a05e] text-white';

    const urgency = tour.seats_left != null && tour.seats_left <= 5
        ? t('tour.seats_left', { count: tour.seats_left })
        : tour.booked_this_week != null && tour.booked_this_week > 0
        ? t('tour.booked_week', { count: tour.booked_this_week })
        : null;

    function handleWishlist(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!auth.user) { router.visit('/login'); return; }
        const next = !isWishlisted;
        setIsWishlisted(next);
        fetch(`/wishlist/${tour.id}`, {
            method: 'POST',
            headers: { 'X-XSRF-TOKEN': csrfToken(), 'Accept': 'application/json' },
        }).catch(() => setIsWishlisted(!next));
        onWishlistToggle?.(tour.id);
    }

    const inclusions = Array.isArray(tour.inclusions) ? tour.inclusions : [];
    const tags: string[] = inclusions.slice(0, 3).map((i) => i.type);

    

    return (
        <a
            href={`/${locale}/${tour.type === 'package' ? 'packages' : 'tours'}/${tour.slug}`}
            className="group block bg-white border border-[rgba(0,0,0,0.1)] rounded-[22px] overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
            {/* Image */}
            <div
                className="relative h-[230px] overflow-hidden shrink-0"
                style={{ background: 'linear-gradient(137.5deg,#3a5a45 0%,#1e3326 60%,#d9722a 100%)' }}
            >
                <img
                    src={tour.card_url || '/images/tours/serengeti.jpg'}
                    alt={typeof tour.title === 'string' ? tour.title : ''}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/images/tours/serengeti.jpg'; }}
                />

                {badge && (
                    <span className={`absolute top-[14px] left-[14px] px-[12px] py-[6px] rounded-full text-[12px] font-bold tracking-[0.36px] leading-[18px] ${badgeBg}`}>
                        {badge}
                    </span>
                )}

                <button
                    onClick={handleWishlist}
                    className="absolute top-[14px] right-[14px] size-[38px] rounded-[19px] bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                    <Heart
                        size={20}
                        className={isWishlisted ? 'fill-[#f0a05e] text-[#f0a05e]' : 'text-[#1a211c]'}
                    />
                </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-[12px] pb-[24px] pt-[20px] px-[24px]">

                {/* Meta + rating */}
                <div className="flex flex-col gap-[9px]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[3px]">
                            <MapPin size={14} className="text-[#8a968d] shrink-0" />
                            <span className="text-[13px] leading-[19.5px] text-[#8a968d] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {tour.destination?.name}{tour.destination?.country ? `, ${tour.destination.country}` : ''} · {t('tour.days', { count: tour.duration_days ?? 0 })}
                            </span>
                        </div>
                        {/* <div className="flex items-center gap-[5px] shrink-0">
                            <Star size={14} className="fill-[#f0a05e] text-[#f0a05e]" />
                            <span className="text-[14px] font-semibold text-[#f0a05e] tracking-[1px] leading-[21px]">
                                {tour.rating_cache?.toFixed(1)}
                            </span>
                        </div> */}
                    </div>

                    {/* Title */}
                    <h3 className="font-display not-italic text-[23px] leading-[24.15px] tracking-[-0.23px] text-[#1a211c]">
                        {typeof tour.title === 'string' ? tour.title : ''}
                    </h3>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 h-[29px] items-start overflow-hidden">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-[#eef3ec] text-[#6e8c79] text-[10px] leading-[18px] font-medium px-[11px] py-[5px] rounded-full whitespace-nowrap"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <hr className="border-[#e4ddd0]" />

                {/* Price + Reserve */}
                <div className="flex flex-col gap-[9px]">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-0">
                            <span className="text-[12px] font-semibold text-[#8a968d] leading-[18px]">{t('tour.from')}</span>
                            <span className="font-display not-italic text-[24px] leading-[36px] text-[#1e3326]">
                                {price}
                            </span>
                        </div>
                        <span className="bg-[#6e8c79] text-white font-bold text-[14px] leading-[21px] px-[18px] py-[10px] rounded-full hover:bg-[#5a7865] transition-colors">
                            {t('tour.reserve')}
                        </span>
                    </div>

                    {urgency && (
                        <div className="flex items-center gap-[3px] pt-px">
                            <Zap size={14} className="text-[#d9722a] shrink-0" />
                            <span className="text-[12px] font-bold text-[#d9722a] leading-[18px]">{urgency}</span>
                        </div>
                    )}
                </div>
            </div>
        </a>
    );
}
