import { Head, router, useForm, usePage } from '@inertiajs/react';
import CheckoutLayout from '../../Components/CheckoutLayout';
import BookingSummary from '../../Components/BookingSummary';
import { AlertTriangle, Minus, Plus } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourAddon, PageProps } from '../../types';

interface Props {
    booking: {
        reference: string;
        tour: Tour;
        adults: number;
        children: number;
        infants: number;
        schedule_id?: number;
        selected_addons?: number[];
    };
}

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BookingDates({ booking }: Props) {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const { tour } = booking;

    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';

    const { data, setData, post, processing, errors } = useForm({
        schedule_id: booking.schedule_id ?? tour.schedules?.[0]?.id ?? ('' as number | ''),
        adults:      booking.adults ?? 2,
        children:    booking.children ?? 0,
        infants:     booking.infants ?? 0,
        addons:      (booking.selected_addons ?? []) as number[],
    });

    const selectedSchedule = tour.schedules?.find(s => s.id === Number(data.schedule_id)) ?? null;

    // Live price calculation  adults at schedule/base price, children at child_price, infants free
    const adultPrice     = selectedSchedule?.price_override ?? tour.base_price;
    const childPrice     = tour.child_price ?? adultPrice;
    const subtotal       = adultPrice * data.adults + childPrice * data.children;
    const selectedAddons = tour.addons?.filter(a => data.addons.includes(a.id)) ?? [];
    const addonsTotal    = selectedAddons.reduce((s, a) => s + a.price * (data.adults + data.children), 0);
    const memberDiscount = Math.round(subtotal * 0.05);
    const taxes          = Math.round((subtotal + addonsTotal - memberDiscount) * 0.008);

    function toggleAddon(id: number) {
        setData('addons', data.addons.includes(id)
            ? data.addons.filter(a => a !== id)
            : [...data.addons, id]
        );
    }

    function handleContinue(e: React.FormEvent) {
        e.preventDefault();
        post(`/booking/${booking.reference}/dates`);
    }

    return (
        <CheckoutLayout step={1}>
            <Head title={t('dates.title')} />

            <form onSubmit={handleContinue}>
                <div className="flex flex-col lg:flex-row gap-[28px] items-start">

                    {/* ── Left column ─────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-[16px]">

                        {/* Page title */}
                        <div className="mb-[4px]">
                            <h1 className="font-display not-italic text-[32px] leading-[1.15] text-[#16241b]">
                                {t('dates.title')}
                            </h1>
                            <p className="text-[13px] text-[#8a968d] mt-[4px]">
                                {t('dates.step_hint')}
                            </p>
                        </div>

                        {/* ── Choose your departure ──────────── */}
                        <Section title={t('dates.choose_departure')}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
                                {tour.schedules?.map(s => {
                                    const start    = new Date(s.start_date);
                                    const end      = new Date(s.end_date);
                                    const selected = Number(data.schedule_id) === s.id;
                                    const lowStock = s.seats_left > 0 && s.seats_left <= 5;
                                    const soldOut  = s.seats_left === 0;

                                    return (
                                        <label
                                            key={s.id}
                                            className={`relative flex flex-col gap-[6px] p-[16px] rounded-[14px] border-[1.5px] cursor-pointer transition-all select-none ${
                                                selected
                                                    ? 'border-[#2E4A39] bg-[#eef3ec]'
                                                    : soldOut
                                                        ? 'border-[#e4ddd0] bg-[#f9f9f9] opacity-50 cursor-not-allowed'
                                                        : 'border-[#e4ddd0] bg-white hover:border-[#c5d3c8]'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="schedule_id"
                                                value={s.id}
                                                checked={selected}
                                                disabled={soldOut}
                                                onChange={() => setData('schedule_id', s.id)}
                                                className="sr-only"
                                            />

                                            {/* Radio indicator */}
                                            <div className={`absolute top-[14px] right-[14px] w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                                                selected ? 'border-[#2E4A39] bg-[#2E4A39]' : 'border-[#c5d3c8] bg-white'
                                            }`}>
                                                {selected && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Date range */}
                                            <p className="font-semibold text-[15px] text-[#16241b] pr-[28px]">
                                                {start.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} – {end.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                                            </p>

                                            {/* Status */}
                                            {soldOut ? (
                                                <p className="text-[12px] text-[#8a968d]">{t('dates.sold_out')}</p>
                                            ) : lowStock ? (
                                                <p className="flex items-center gap-[4px] text-[12px] text-[#E07A3F] font-medium">
                                                    <AlertTriangle size={11} />
                                                    {t('dates.only_slots', { count: s.seats_left })}
                                                </p>
                                            ) : (
                                                <p className="text-[12px] text-[#8a968d]">{t('dates.available')}</p>
                                            )}

                                            {/* Year */}
                                            <p className="text-[12px] text-[#8a968d]">
                                                {end.getFullYear()}
                                            </p>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.schedule_id && (
                                <p className="text-[12px] text-red-500 mt-[8px]">{errors.schedule_id}</p>
                            )}
                        </Section>

                        {/* ── Who's travelling? ─────────────── */}
                        <Section title={t('dates.who_travelling')}>
                            <div className="divide-y divide-[#f0ede8]">
                                <Counter
                                    label={t('search.adults')}
                                    sublabel={`${fmt(adultPrice)} ${t('show.per_person')}`}
                                    value={data.adults}
                                    min={1}
                                    max={tour.max_group_size ?? 20}
                                    onChange={v => setData('adults', v)}
                                />
                                <Counter
                                    label={t('search.children')}
                                    sublabel={`${t('dates.children_sub')} · ${fmt(childPrice)} ${t('show.per_person')}`}
                                    value={data.children}
                                    min={0}
                                    max={Math.max(0, (tour.max_group_size ?? 20) - data.adults)}
                                    onChange={v => setData('children', v)}
                                />
                                <Counter
                                    label={t('search.infants')}
                                    sublabel={t('dates.infants_sub')}
                                    value={data.infants}
                                    min={0}
                                    max={4}
                                    onChange={v => setData('infants', v)}
                                />
                            </div>
                        </Section>

                        {/* ── Enhance your trip ─────────────── */}
                        {(tour.addons?.length ?? 0) > 0 && (
                            <Section title={t('dates.enhance_trip')} badge={t('dates.optional')}>
                                <div className="space-y-[2px]">
                                    {tour.addons!.map(addon => {
                                        const checked = data.addons.includes(addon.id);
                                        return (
                                            <label
                                                key={addon.id}
                                                className="flex items-start gap-[12px] py-[14px] border-b border-[#f0ede8] last:border-b-0 cursor-pointer group"
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    className={`mt-[1px] w-[20px] h-[20px] rounded-[6px] border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${
                                                        checked ? 'bg-[#2E4A39] border-[#2E4A39]' : 'border-[#c5d3c8] group-hover:border-[#2E4A39]'
                                                    }`}
                                                >
                                                    {checked && (
                                                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAddon(addon.id)}
                                                    className="sr-only"
                                                />

                                                {/* Text */}
                                                <div className="flex-1">
                                                    <p className="text-[14px] font-semibold text-[#16241b] leading-[1.3]">
                                                        {addon.name}
                                                    </p>
                                                    {addon.description && (
                                                        <p className="text-[12px] text-[#8a968d] mt-[2px]">
                                                            {addon.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <span className="text-[14px] font-semibold text-[#16241b] shrink-0">
                                                    +{fmt(addon.price)}<span className="text-[#8a968d] font-normal text-[12px]">{t('show.per_person')}</span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Section>
                        )}

                        {/* ── Navigation ────────────────────── */}
                        <div className="flex items-center justify-between pt-[8px]">
                            <button
                                type="button"
                                onClick={() => router.visit(tour.slug ? `/${locale}/tours/${tour.slug}` : `/${locale}/tours`)}
                                className="flex items-center gap-[6px] text-[13px] font-medium text-[#4f5c53] hover:text-[#2E4A39] transition-colors"
                            >
                                {t('dates.back')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.schedule_id}
                                className="flex items-center gap-[8px] px-[28px] py-[13px] rounded-full bg-[#2E4A39] text-white text-[14px] font-semibold hover:bg-[#1e3326] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? t('dates.saving') : `${t('dates.continue')} →`}
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Summary sidebar ────────────── */}
                    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
                        <BookingSummary
                            tour={tour}
                            schedule={selectedSchedule}
                            adults={data.adults}
                            children={data.children}
                            infants={data.infants}
                            childPrice={childPrice}
                            addons={selectedAddons.map(a => ({ addon: a, quantity: data.adults + data.children }))}
                            memberDiscount={memberDiscount}
                            taxes={taxes}
                        />
                    </div>
                </div>
            </form>
        </CheckoutLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[18px] border border-[#e4ddd0] p-[22px]">
            <div className="flex items-center gap-[10px] mb-[16px]">
                <h2 className="text-[15px] font-bold text-[#16241b]">{title}</h2>
                {badge && (
                    <span className="text-[11px] font-semibold text-[#8a968d] bg-[#f0ede8] px-[8px] py-[2px] rounded-full uppercase tracking-[0.5px]">
                        {badge}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function Counter({ label, sublabel, value, min, max, onChange }: {
    label: string; sublabel?: string; value: number; min: number; max: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between py-[14px]">
            <div>
                <p className="text-[14px] font-medium text-[#16241b]">{label}</p>
                {sublabel && <p className="text-[12px] text-[#8a968d] mt-[1px]">{sublabel}</p>}
            </div>
            <div className="flex items-center gap-[14px]">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="w-[34px] h-[34px] rounded-full border border-[#e4ddd0] flex items-center justify-center text-[#16241b] hover:border-[#2E4A39] hover:text-[#2E4A39] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Minus size={14} />
                </button>
                <span className="w-[20px] text-center text-[15px] font-bold text-[#16241b]">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-[34px] h-[34px] rounded-full border border-[#e4ddd0] flex items-center justify-center text-[#16241b] hover:border-[#2E4A39] hover:text-[#2E4A39] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );
}
