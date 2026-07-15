import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CheckoutLayout from '../../Components/CheckoutLayout';
import BookingSummary from '../../Components/BookingSummary';
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Minus, Plus, Users } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, PageProps } from '../../types';

interface Props {
    booking: {
        reference: string;
        tour: Tour;
        adults: number;
        children: number;
        infants: number;
        schedule_id?: number;
        custom_date?: string | null;
        departure_time?: string | null;
        selected_addons?: number[];
    };
}

const DEPARTURE_TIMES = ['06:00', '08:00', '10:00', '14:00'];

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BookingDates({ booking }: Props) {
    const { locale, auth, settings } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const { tour } = booking;

    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';

    const flexibleAllowed = !!tour.flexible_dates;

    // Flexible (pick-your-own-date) is the default experience; fall back to
    // fixed departures when the tour doesn't allow it or one is already chosen.
    const initialMode: 'fixed' | 'flexible' =
        booking.custom_date && flexibleAllowed ? 'flexible'
        : booking.schedule_id ? 'fixed'
        : flexibleAllowed ? 'flexible'
        : 'fixed';

    const { data, setData, post, processing, errors } = useForm({
        schedule_id: booking.schedule_id ?? (initialMode === 'fixed' ? tour.schedules?.[0]?.id ?? ('' as number | '') : ('' as number | '')),
        custom_date: booking.custom_date ?? '',
        departure_time: booking.departure_time ?? '',
        adults:      booking.adults ?? 2,
        children:    booking.children ?? 0,
        infants:     booking.infants ?? 0,
        addons:      (booking.selected_addons ?? []) as number[],
    });

    const [mode, setMode] = useState<'fixed' | 'flexible'>(initialMode);

    function switchMode(next: 'fixed' | 'flexible') {
        setMode(next);
        if (next === 'fixed') {
            setData(d => ({ ...d, custom_date: '', schedule_id: d.schedule_id || (tour.schedules?.[0]?.id ?? '') }));
        } else {
            setData(d => ({ ...d, schedule_id: '' }));
        }
    }

    const fixedSchedule = tour.schedules?.find(s => s.id === Number(data.schedule_id)) ?? null;

    // Synthetic schedule for a custom (flexible) departure, so the summary
    // sidebar can render the date range
    const customSchedule: TourSchedule | null = data.custom_date
        ? ({
              id: 0,
              start_date: data.custom_date,
              end_date: (() => {
                  const end = new Date(data.custom_date + 'T00:00:00');
                  end.setDate(end.getDate() + Math.max(0, (tour.duration_days ?? 1) - 1));
                  return end.toISOString().slice(0, 10);
              })(),
              capacity: tour.max_group_size ?? 20,
              seats_left: tour.max_group_size ?? 20,
              price_override: null,
          } as unknown as TourSchedule)
        : null;

    const selectedSchedule = mode === 'flexible' ? customSchedule : fixedSchedule;

    // Live price calculation — mirrors BookingPriceCalculator order
    const baseAdultPrice = (mode === 'fixed' ? fixedSchedule?.price_override : null) ?? tour.base_price;
    const tourDiscPct    = tour.discount_percent ?? 0;
    const adultPrice     = Math.round(baseAdultPrice * (1 - tourDiscPct / 100));
    const childPrice     = Math.round((tour.child_price ?? baseAdultPrice) * (1 - tourDiscPct / 100));
    const subtotal       = adultPrice * data.adults + childPrice * data.children;
    const selectedAddons = tour.addons?.filter(a => data.addons.includes(a.id)) ?? [];
    const addonsTotal    = selectedAddons.reduce((s, a) => s + a.price * (data.adults + data.children), 0);
    const tierDiscPct    = settings.tier_discount_percent;
    const memberDiscount = auth.user ? Math.round((subtotal + addonsTotal) * tierDiscPct / 100) : 0;
    const taxPct         = settings.tax_fee_percent;
    const taxes          = Math.round((subtotal + addonsTotal - memberDiscount) * taxPct / 100);

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
                            {flexibleAllowed && (
                                <div className="flex gap-[8px] mb-[16px]">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('fixed')}
                                        className={`flex items-center gap-[6px] px-[16px] py-[9px] rounded-full text-[13px] font-semibold border-[1.5px] transition-colors ${
                                            mode === 'fixed'
                                                ? 'border-[#2E4A39] bg-[#eef3ec] text-[#2E4A39]'
                                                : 'border-[#e4ddd0] bg-white text-[#4f5c53] hover:border-[#c5d3c8]'
                                        }`}
                                    >
                                        <Users size={14} />
                                        {t('dates.mode_fixed')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => switchMode('flexible')}
                                        className={`flex items-center gap-[6px] px-[16px] py-[9px] rounded-full text-[13px] font-semibold border-[1.5px] transition-colors ${
                                            mode === 'flexible'
                                                ? 'border-[#2E4A39] bg-[#eef3ec] text-[#2E4A39]'
                                                : 'border-[#e4ddd0] bg-white text-[#4f5c53] hover:border-[#c5d3c8]'
                                        }`}
                                    >
                                        <CalendarDays size={14} />
                                        {t('dates.mode_flexible')}
                                    </button>
                                </div>
                            )}

                            {mode === 'flexible' ? (
                                <div>
                                    <p className="text-[12px] text-[#8a968d] mb-[14px]">{t('dates.flexible_hint')}</p>
                                    <DateCalendar
                                        value={data.custom_date}
                                        locale={dateLocale}
                                        durationDays={tour.duration_days ?? 1}
                                        onChange={date => setData('custom_date', date)}
                                    />
                                    {errors.custom_date && (
                                        <p className="text-[12px] text-red-500 mt-[8px]">{errors.custom_date}</p>
                                    )}

                                    {/* Preferred departure time */}
                                    <div className="mt-[18px]">
                                        <p className="text-[13px] font-semibold text-[#16241b] mb-[8px]">{t('dates.departure_time')}</p>
                                        <div className="flex flex-wrap gap-[8px]">
                                            <button
                                                type="button"
                                                onClick={() => setData('departure_time', '')}
                                                className={`px-[14px] py-[8px] rounded-full text-[12px] font-medium border-[1.5px] transition-colors ${
                                                    !data.departure_time
                                                        ? 'border-[#2E4A39] bg-[#eef3ec] text-[#2E4A39]'
                                                        : 'border-[#e4ddd0] bg-white text-[#4f5c53] hover:border-[#c5d3c8]'
                                                }`}
                                            >
                                                {t('dates.no_preference')}
                                            </button>
                                            {DEPARTURE_TIMES.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => setData('departure_time', time)}
                                                    className={`px-[14px] py-[8px] rounded-full text-[12px] font-medium border-[1.5px] transition-colors ${
                                                        data.departure_time === time
                                                            ? 'border-[#2E4A39] bg-[#eef3ec] text-[#2E4A39]'
                                                            : 'border-[#e4ddd0] bg-white text-[#4f5c53] hover:border-[#c5d3c8]'
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
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
                            )}
                            {mode === 'fixed' && errors.schedule_id && (
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
                                onClick={() => router.visit(tour.slug ? `/${locale}/${tour.type === 'package' ? 'packages' : 'tours'}/${tour.slug}` : `/${locale}/tours`)}
                                className="flex items-center gap-[6px] text-[13px] font-medium text-[#4f5c53] hover:text-[#2E4A39] transition-colors"
                            >
                                {t('dates.back')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing || (mode === 'fixed' ? !data.schedule_id : !data.custom_date)}
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

function toDateString(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function DateCalendar({ value, locale, durationDays, onChange }: {
    value: string;
    locale: string;
    durationDays: number;
    onChange: (date: string) => void;
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 2); // matches backend "after:tomorrow" rule

    const initial = value ? new Date(value + 'T00:00:00') : minDate;
    const [viewYear, setViewYear] = useState(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState(initial.getMonth());

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday-first grid

    const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

    const selectedEnd = value
        ? (() => {
              const end = new Date(value + 'T00:00:00');
              end.setDate(end.getDate() + Math.max(0, durationDays - 1));
              return end;
          })()
        : null;

    const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, i + 1).toLocaleDateString(locale, { weekday: 'narrow' })
    );

    function prevMonth() {
        if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
        else setViewMonth(viewMonth - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
        else setViewMonth(viewMonth + 1);
    }

    return (
        <div className="max-w-[360px]">
            {/* Month header */}
            <div className="flex items-center justify-between mb-[10px]">
                <button
                    type="button"
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                    className="w-[30px] h-[30px] rounded-full border border-[#e4ddd0] flex items-center justify-center text-[#16241b] hover:border-[#2E4A39] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <p className="text-[14px] font-bold text-[#16241b] capitalize">
                    {firstOfMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                </p>
                <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="w-[30px] h-[30px] rounded-full border border-[#e4ddd0] flex items-center justify-center text-[#16241b] hover:border-[#2E4A39] transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Weekday row */}
            <div className="grid grid-cols-7 mb-[4px]">
                {weekdayLabels.map((label, i) => (
                    <span key={i} className="text-center text-[11px] font-semibold text-[#8a968d] py-[4px]">{label}</span>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: startWeekday }).map((_, i) => <span key={`pad-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const date = new Date(viewYear, viewMonth, i + 1);
                    const dateStr = toDateString(date);
                    const disabled = date < minDate;
                    const isStart = value === dateStr;
                    const inRange = !!value && !!selectedEnd
                        && date > new Date(value + 'T00:00:00') && date <= selectedEnd;

                    return (
                        <button
                            key={dateStr}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(dateStr)}
                            className={`h-[38px] rounded-[10px] text-[13px] font-medium transition-colors ${
                                isStart
                                    ? 'bg-[#2E4A39] text-white'
                                    : inRange
                                        ? 'bg-[#eef3ec] text-[#2E4A39]'
                                        : disabled
                                            ? 'text-[#c9cfc9] cursor-not-allowed'
                                            : 'text-[#16241b] hover:bg-[#eef3ec]'
                            }`}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

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
