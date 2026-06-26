import { MapPin, CheckCircle2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourAddon, PageProps } from '../types';

interface Props {
    tour: Tour;
    schedule?: TourSchedule | null;
    /** Legacy single count (used from pages that don't split by type) */
    travelers?: number;
    adults?: number;
    children?: number;
    infants?: number;
    childPrice?: number;
    addons?: { addon: TourAddon; quantity: number }[];
    memberDiscount?: number;
    taxes?: number;
    total?: number;
    depositAmount?: number;
    showDeposit?: boolean;
    showPaid?: boolean;
}

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BookingSummary({
    tour, schedule,
    travelers,          // legacy: used when adults/children aren't split
    adults: adultsProp,
    children: childrenProp = 0,
    infants: infantsProp = 0,
    childPrice: childPriceProp,
    addons = [], memberDiscount = 0, taxes = 0,
    total, depositAmount, showDeposit, showPaid,
}: Props) {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();

    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';

    const adultPrice = tour.base_price;
    const childPrice = childPriceProp ?? tour.child_price ?? adultPrice;

    // Support both split (adults/children/infants) and legacy (travelers) usage
    const adults   = adultsProp ?? travelers ?? 1;
    const children = adultsProp !== undefined ? childrenProp : 0;
    const infants  = adultsProp !== undefined ? infantsProp : 0;

    const adultSubtotal   = adultPrice * adults;
    const childSubtotal   = childPrice * children;
    const addonsTotal     = addons.reduce((s, a) => s + a.addon.price * (a.addon.per === 'person' ? a.quantity : 1), 0);
    const computed        = total ?? (adultSubtotal + childSubtotal + addonsTotal - memberDiscount + taxes);

    const dateLabel = schedule
        ? `${new Date(schedule.start_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} – ${new Date(schedule.end_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`
        : null;

    const cancelDate = schedule && tour.cancellation_days
        ? new Date(new Date(schedule.start_date).getTime() - tour.cancellation_days * 86400000)
              .toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    const displayAmount = showDeposit && depositAmount ? depositAmount : computed;

    const totalLabel = showPaid
        ? t('summary.total_paid')
        : showDeposit
        ? t('summary.due_today')
        : t('summary.total');

    const totalPax = adults + children + infants;

    return (
        <div className="bg-white rounded-[20px] border border-[#e4ddd0] overflow-hidden sticky top-[120px]">

            {/* Tour image */}
            <div className="aspect-[4/3] overflow-hidden bg-[#f0ede8]">
                <img
                    src={tour.card_url || '/images/tours/serengeti.jpg'}
                    alt={typeof tour.title === 'string' ? tour.title : ''}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/images/tours/serengeti.jpg'; }}
                />
            </div>

            <div className="p-[20px]">
                {/* Tour title + location */}
                <h3 className="font-display not-italic text-[16px] leading-[1.3] text-[#16241b] mb-[4px]">
                    {typeof tour.title === 'string' ? tour.title : ''}
                </h3>
                {tour.destination && (
                    <p className="flex items-center gap-[5px] text-[12px] text-[#8a968d]">
                        <MapPin size={11} className="shrink-0" />
                        {tour.destination.name}, {tour.destination.country}
                    </p>
                )}

                {/* Date + travelers */}
                {(dateLabel || totalPax > 0) && (
                    <div className="mt-[14px] pt-[14px] border-t border-[#f0ede8] space-y-[7px]">
                        {dateLabel && (
                            <div className="flex justify-between text-[13px]">
                                <span className="text-[#8a968d]">{t('summary.dates')}</span>
                                <span className="font-semibold text-[#16241b]">{dateLabel}</span>
                            </div>
                        )}
                        {totalPax > 0 && (
                            <div className="flex justify-between text-[13px]">
                                <span className="text-[#8a968d]">{t('summary.travelers')}</span>
                                <span className="font-semibold text-[#16241b]">
                                    {adults} {adults === 1 ? t('summary.adult') : t('summary.adults')}
                                    {children > 0 && `, ${children} ${t('summary.children')}`}
                                    {infants > 0 && `, ${infants} ${t('summary.infants')}`}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Price breakdown */}
                <div className="mt-[14px] pt-[14px] border-t border-[#f0ede8] space-y-[8px]">
                    {adults > 0 && (
                        <Line label={`${fmt(adultPrice)} × ${adults} ${adults === 1 ? t('summary.adult') : t('summary.adults')}`} amount={adultSubtotal} />
                    )}
                    {children > 0 && (
                        <Line label={`${fmt(childPrice)} × ${children} ${t('summary.children')}`} amount={childSubtotal} />
                    )}
                    {infants > 0 && (
                        <Line label={`${infants} ${t('summary.infants')}`} amount={0} muted freeLabel={t('summary.free')} />
                    )}
                    {addons.map(a => (
                        <Line
                            key={a.addon.id}
                            label={a.addon.name}
                            amount={a.addon.price * (a.addon.per === 'person' ? a.quantity : 1)}
                        />
                    ))}
                    {memberDiscount > 0 && (
                        <Line label={t('summary.member_saving')} amount={-memberDiscount} accent />
                    )}
                    {taxes > 0 && (
                        <Line label={t('summary.taxes')} amount={taxes} />
                    )}
                </div>

                {/* Total */}
                <div className="mt-[14px] pt-[14px] border-t border-[#e4ddd0] flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-[#16241b]">{totalLabel}</span>
                    <span className="text-[20px] font-bold text-[#16241b]">{fmt(displayAmount)}</span>
                </div>

                {/* Cancellation notice */}
                {cancelDate && (
                    <div className="mt-[12px] flex items-start gap-[8px] bg-[#eef3ec] rounded-[12px] px-[12px] py-[10px]">
                        <CheckCircle2 size={13} className="text-[#2E4A39] mt-[1px] shrink-0" />
                        <p className="text-[12px] text-[#2E4A39] font-medium leading-[1.4]">
                            {t('summary.free_cancel', { date: cancelDate })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Line({ label, amount, accent, muted, freeLabel }: { label: string; amount: number; accent?: boolean; muted?: boolean; freeLabel?: string }) {
    const color    = accent ? 'text-[#E07A3F]' : muted ? 'text-[#8a968d]' : 'text-[#4f5c53]';
    const valColor = accent ? 'text-[#E07A3F]' : muted ? 'text-[#8a968d]' : 'text-[#16241b]';
    const display  = freeLabel && amount === 0 ? freeLabel : amount < 0 ? `–${fmt(Math.abs(amount))}` : fmt(amount);
    return (
        <div className="flex justify-between items-center text-[13px]">
            <span className={color}>{label}</span>
            <span className={`font-medium ${valColor}`}>{display}</span>
        </div>
    );
}
