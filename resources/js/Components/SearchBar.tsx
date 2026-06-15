import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Search, MapPin, Calendar, Users, Compass,
    ChevronLeft, ChevronRight, Minus, Plus,
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    eachDayOfInterval, getDay, isSameDay, isBefore, isAfter,
    startOfDay, isToday,
} from 'date-fns';
import { enUS, fr as frLocale, es as esLocale } from 'date-fns/locale';
import type { PageProps } from '../types';
import type { Locale } from 'date-fns';

// ─── Date-fns locale map ──────────────────────────────────────────────────────

const DATE_LOCALES: Record<string, Locale> = { en: enUS, fr: frLocale, es: esLocale };

// ─── Static data ──────────────────────────────────────────────────────────────

const DESTINATIONS = [
    { name: 'Masai Mara',           country: 'Kenya',        slug: 'masai-mara' },
    { name: 'Victoria Falls',       country: 'Zambia',       slug: 'victoria-falls' },
    { name: 'Cape Town',            country: 'South Africa', slug: 'cape-town' },
    { name: 'Sahara & Marrakech',   country: 'Morocco',      slug: 'sahara-marrakech' },
    { name: 'Bwindi Forest',        country: 'Uganda',       slug: 'bwindi-forest' },
    { name: 'Serengeti',            country: 'Tanzania',     slug: 'serengeti' },
    { name: 'Zanzibar',             country: 'Tanzania',     slug: 'zanzibar' },
    { name: 'Kilimanjaro',          country: 'Tanzania',     slug: 'kilimanjaro' },
    { name: 'Okavango Delta',       country: 'Botswana',     slug: 'okavango-delta' },
    { name: 'Kruger National Park', country: 'South Africa', slug: 'kruger' },
];

type ActiveField = 'destination' | 'dates' | 'travelers' | 'experience' | null;

interface TravelerState { adults: number; children: number; infants: number }

interface Props {
    sticky?: boolean;
    initialValues?: {
        destination?: string;
        dates?: string;
        travelers?: string;
        experience?: string;
    };
}

// ─── Popover shell ────────────────────────────────────────────────────────────

function Popover({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`absolute top-[calc(100%+10px)] bg-white border border-[#e4ddd0] rounded-[20px]
                        shadow-[0px_8px_24px_rgba(0,0,0,0.10),0px_2px_6px_rgba(0,0,0,0.06)]
                        z-[200] overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

interface CalendarProps {
    startDate: Date | null;
    endDate: Date | null;
    onSelect: (start: Date | null, end: Date | null) => void;
    onClose: () => void;
    dateLocale: Locale;
    dayLabels: string[];
    t: (key: string) => string;
}

function CalendarPanel({ startDate, endDate, onSelect, onClose, dateLocale, dayLabels, t }: CalendarProps) {
    const today = startOfDay(new Date());
    const [viewMonth, setViewMonth] = useState(today);
    const [hovered, setHovered] = useState<Date | null>(null);
    const selecting = startDate && !endDate;

    function buildDays(month: Date) {
        const first = startOfMonth(month);
        const last  = endOfMonth(month);
        const days  = eachDayOfInterval({ start: first, end: last });
        const offset = (getDay(first) + 6) % 7; // ISO Mon=0
        return { days, offset };
    }

    function handleDay(day: Date) {
        if (isBefore(day, today)) return;
        if (!startDate || (startDate && endDate)) {
            onSelect(day, null);
        } else {
            const [lo, hi] = isBefore(day, startDate) ? [day, startDate] : [startDate, day];
            onSelect(lo, hi);
        }
    }

    function inRange(day: Date) {
        const end = selecting ? hovered : endDate;
        if (!startDate || !end) return false;
        const [lo, hi] = isBefore(startDate, end) ? [startDate, end] : [end, startDate];
        return isAfter(day, lo) && isBefore(day, hi);
    }

    const months = [viewMonth, addMonths(viewMonth, 1)];

    return (
        <div>
            <div className="flex p-4 gap-5">
                {months.map((month, mi) => {
                    const { days, offset } = buildDays(month);
                    return (
                        <div key={mi} className="min-w-[210px]">
                            {/* Month header */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                {mi === 0 ? (
                                    <button
                                        onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                                        className="p-1.5 rounded-lg hover:bg-[#eef3ec] transition-colors"
                                    >
                                        <ChevronLeft size={15} className="text-[#8a968d]" />
                                    </button>
                                ) : <span className="w-7" />}
                                <span className="text-[13px] font-semibold text-[#1a211c] capitalize">
                                    {format(month, 'MMMM yyyy', { locale: dateLocale })}
                                </span>
                                {mi === 1 ? (
                                    <button
                                        onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                                        className="p-1.5 rounded-lg hover:bg-[#eef3ec] transition-colors"
                                    >
                                        <ChevronRight size={15} className="text-[#8a968d]" />
                                    </button>
                                ) : <span className="w-7" />}
                            </div>

                            {/* Day-of-week labels */}
                            <div className="grid grid-cols-7 mb-1">
                                {dayLabels.map(d => (
                                    <span key={d} className="text-center text-[11px] font-semibold text-[#8a968d] py-1">
                                        {d}
                                    </span>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div className="grid grid-cols-7">
                                {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
                                {days.map((day) => {
                                    const past  = isBefore(day, today);
                                    const isStart = startDate && isSameDay(day, startDate);
                                    const isEnd   = endDate ? isSameDay(day, endDate) : (selecting && hovered ? isSameDay(day, hovered) : false);
                                    const inRng   = inRange(day);
                                    const todayMk = isToday(day);
                                    return (
                                        <button
                                            key={day.toISOString()}
                                            disabled={past}
                                            onClick={() => handleDay(day)}
                                            onMouseEnter={() => selecting && setHovered(day)}
                                            onMouseLeave={() => setHovered(null)}
                                            className={[
                                                'relative h-8 w-full text-[13px] font-medium transition-colors select-none',
                                                past
                                                    ? 'text-[#d0d0d0] cursor-not-allowed'
                                                    : 'cursor-pointer',
                                                isStart || isEnd
                                                    ? 'bg-[#6e8c79] text-white rounded-full hover:bg-[#5a7865]'
                                                    : '',
                                                inRng && !isStart && !isEnd
                                                    ? 'bg-[#eef3ec] text-[#1a211c]'
                                                    : '',
                                                !isStart && !isEnd && !inRng && !past
                                                    ? 'rounded-full hover:bg-[#eef3ec] text-[#1a211c]'
                                                    : '',
                                                todayMk && !isStart && !isEnd
                                                    ? 'font-bold !text-[#6e8c79]'
                                                    : '',
                                            ].filter(Boolean).join(' ')}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0ede8]">
                <button
                    onClick={() => onSelect(null, null)}
                    className="text-[13px] text-[#8a968d] hover:text-[#1a211c] transition-colors"
                >
                    {t('cal.clear_dates')}
                </button>
                <button
                    onClick={onClose}
                    disabled={!startDate}
                    className="px-4 py-2 bg-[#6e8c79] text-white text-[13px] font-semibold rounded-full hover:bg-[#5a7865] disabled:opacity-40 transition-colors"
                >
                    {startDate && !endDate ? t('cal.pick_end') : t('cal.apply')}
                </button>
            </div>
        </div>
    );
}

// ─── Travelers panel ──────────────────────────────────────────────────────────

interface TravelersPanelProps {
    value: TravelerState;
    onChange: (v: TravelerState) => void;
    onClose: () => void;
    t: (key: string) => string;
}

function TravelersPanel({ value, onChange, onClose, t }: TravelersPanelProps) {
    const rows: { key: keyof TravelerState; labelKey: string; subKey: string; min: number }[] = [
        { key: 'adults',   labelKey: 'search.adults',   subKey: 'search.adults_sub',   min: 1 },
        { key: 'children', labelKey: 'search.children', subKey: 'search.children_sub', min: 0 },
        { key: 'infants',  labelKey: 'search.infants',  subKey: 'search.infants_sub',  min: 0 },
    ];

    function adjust(key: keyof TravelerState, delta: number) {
        const row = rows.find(r => r.key === key)!;
        onChange({ ...value, [key]: Math.max(row.min, Math.min(20, value[key] + delta)) });
    }

    return (
        <div className="w-[290px]">
            <div className="px-5 pt-4 pb-2">
                {rows.map((row, i) => (
                    <div
                        key={row.key}
                        className={`flex items-center justify-between py-3.5 ${i < rows.length - 1 ? 'border-b border-[#f0ede8]' : ''}`}
                    >
                        <div>
                            <div className="text-[14px] font-semibold text-[#1a211c]">{t(row.labelKey)}</div>
                            <div className="text-[12px] text-[#8a968d] mt-0.5">{t(row.subKey)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => adjust(row.key, -1)}
                                disabled={value[row.key] <= row.min}
                                className="size-8 rounded-full border border-[#e4ddd0] flex items-center justify-center
                                           text-[#6e8c79] hover:border-[#6e8c79] hover:bg-[#eef3ec]
                                           disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-5 text-center text-[15px] font-bold text-[#1a211c]">
                                {value[row.key]}
                            </span>
                            <button
                                onClick={() => adjust(row.key, +1)}
                                className="size-8 rounded-full border border-[#e4ddd0] flex items-center justify-center
                                           text-[#6e8c79] hover:border-[#6e8c79] hover:bg-[#eef3ec] transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="px-5 pb-4 pt-2">
                <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#6e8c79] text-white text-[14px] font-semibold rounded-full
                               hover:bg-[#5a7865] transition-colors"
                >
                    {t('search.done')}
                </button>
            </div>
        </div>
    );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────

export default function SearchBar({ initialValues, sticky: _sticky }: Props) {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const barRef = useRef<HTMLDivElement>(null);

    const dateLocale = DATE_LOCALES[locale] ?? enUS;

    const DAY_LABELS = [
        t('cal.day_mo'), t('cal.day_tu'), t('cal.day_we'), t('cal.day_th'),
        t('cal.day_fr'), t('cal.day_sa'), t('cal.day_su'),
    ];

    const EXPERIENCES = [
        { value: 'safari',    labelKey: 'search.exp_safari',    emoji: '🦁' },
        { value: 'beach',     labelKey: 'search.exp_beach',     emoji: '🏖️' },
        { value: 'mountain',  labelKey: 'search.exp_mountain',  emoji: '🏔️' },
        { value: 'culture',   labelKey: 'search.exp_culture',   emoji: '🎭' },
        { value: 'gorilla',   labelKey: 'search.exp_gorilla',   emoji: '🦍' },
        { value: 'honeymoon', labelKey: 'search.exp_honeymoon', emoji: '💑' },
    ];

    const [active, setActive] = useState<ActiveField>(null);

    // Destination
    const [destQuery,    setDestQuery]    = useState(initialValues?.destination ?? '');
    const [destSelected, setDestSelected] = useState('');

    // Dates
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate,   setEndDate]   = useState<Date | null>(null);

    // Travelers
    const [travelers, setTravelers] = useState<TravelerState>({ adults: 2, children: 0, infants: 0 });

    // Experience
    const [experience, setExperience] = useState(initialValues?.experience ?? '');

    // Click-outside close
    const close = useCallback(() => setActive(null), []);
    useEffect(() => {
        function onDown(e: MouseEvent) {
            if (barRef.current && !barRef.current.contains(e.target as Node)) close();
        }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [close]);

    function toggle(field: ActiveField) {
        setActive(prev => (prev === field ? null : field));
    }

    // ── Derived display labels ────────────────────────────────────────────────

    const datesLabel = startDate
        ? endDate
            ? `${format(startDate, 'MMM d', { locale: dateLocale })} – ${format(endDate, 'MMM d, yyyy', { locale: dateLocale })}`
            : `${format(startDate, 'MMM d', { locale: dateLocale })} →`
        : '';

    const travelersLabel = [
        travelers.adults   ? `${travelers.adults} ${travelers.adults   > 1 ? t('search.adults').toLowerCase()   : t('search.adults').toLowerCase().replace(/s$/, '')}` : '',
        travelers.children ? `${travelers.children} ${travelers.children > 1 ? t('search.children').toLowerCase() : t('search.children').toLowerCase().replace(/s$/, '')}` : '',
        travelers.infants  ? `${travelers.infants} ${travelers.infants  > 1 ? t('search.infants').toLowerCase()  : t('search.infants').toLowerCase().replace(/s$/, '')}` : '',
    ].filter(Boolean).join(', ');

    const expLabel = EXPERIENCES.find(e => e.value === experience)?.labelKey
        ? t(EXPERIENCES.find(e => e.value === experience)!.labelKey)
        : '';

    // ── Destination list ─────────────────────────────────────────────────────
    const filtered = DESTINATIONS.filter(d =>
        !destQuery ||
        d.name.toLowerCase().includes(destQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(destQuery.toLowerCase())
    );

    // ── Submit ───────────────────────────────────────────────────────────────
    function handleSearch() {
        const params: Record<string, string> = {};
        if (destSelected || destQuery) params.destination = destSelected || destQuery;
        if (startDate)  params.date_from  = format(startDate, 'yyyy-MM-dd');
        if (endDate)    params.date_to    = format(endDate, 'yyyy-MM-dd');
        const tot = travelers.adults + travelers.children + travelers.infants;
        if (tot > 0)    params.travelers  = String(tot);
        if (experience) params.experience = experience;
        setActive(null);
        router.get(`/${locale}/tours`, params);
    }

    // ── Shared styles ─────────────────────────────────────────────────────────
    const field = (f: ActiveField) =>
        `flex-1 min-w-0 px-[22px] py-[12px] flex flex-col gap-[3px] rounded-[100px] cursor-pointer transition-colors select-none
         ${active === f ? 'bg-[#eef3ec]' : 'hover:bg-[#f9f9f9]'}`;

    return (
        <div ref={barRef} className="relative w-full">

            {/* ── Pill ─────────────────────────────────────────────────────── */}
            <div className="bg-white border border-[#d8d8d8] rounded-[100px]
                            shadow-[0px_7px_7.5px_rgba(0,0,0,0.05),0px_28px_14px_rgba(0,0,0,0.04),0px_63px_19px_rgba(0,0,0,0.03)]
                            flex items-center px-[10px] py-[8px] w-full">

                {/* Destination */}
                <div className={field('destination')} onClick={() => toggle('destination')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">{t('search.destination')}</span>
                    <input
                        type="text"
                        placeholder={t('search.destination_placeholder')}
                        value={destQuery}
                        onChange={e => {
                            setDestQuery(e.target.value);
                            setDestSelected('');
                            setActive('destination');
                        }}
                        onClick={e => { e.stopPropagation(); setActive('destination'); }}
                        className="text-[15px] text-[#1a211c] bg-transparent outline-none placeholder-[#8a968d] w-full cursor-pointer"
                    />
                </div>

                <div className="w-px h-[38px] bg-[#e4ddd0] shrink-0" />

                {/* Dates */}
                <div className={field('dates')} onClick={() => toggle('dates')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">{t('search.dates')}</span>
                    <span className={`text-[15px] leading-[22px] ${datesLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {datesLabel || t('search.dates_placeholder')}
                    </span>
                </div>

                <div className="w-px h-[38px] bg-[#e4ddd0] shrink-0" />

                {/* Travelers */}
                <div className={field('travelers')} onClick={() => toggle('travelers')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">{t('search.travelers')}</span>
                    <span className={`text-[15px] leading-[22px] ${travelersLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {travelersLabel || t('search.travelers_placeholder')}
                    </span>
                </div>

                <div className="w-px h-[38px] bg-[#e4ddd0] shrink-0" />

                {/* Experience */}
                <div className={field('experience')} onClick={() => toggle('experience')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">{t('search.experience')}</span>
                    <span className={`text-[15px] leading-[22px] ${expLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {expLabel || t('search.experience_placeholder')}
                    </span>
                </div>

                {/* Search button */}
                <div className="pl-[6px] shrink-0">
                    <button
                        onClick={handleSearch}
                        className="size-[62px] bg-[#6e8c79] rounded-full flex items-center justify-center
                                   text-white hover:bg-[#5a7865] transition-colors"
                    >
                        <Search size={22} />
                    </button>
                </div>
            </div>

            {/* ── Popovers ─────────────────────────────────────────────────── */}

            {/* Destination dropdown */}
            {active === 'destination' && (
                <Popover className="left-0 w-[320px]">
                    <div className="max-h-[300px] overflow-y-auto py-2">
                        {filtered.length === 0 ? (
                            <div className="px-5 py-4 text-[13px] text-[#8a968d]">{t('search.no_destinations')}</div>
                        ) : filtered.map(d => (
                            <button
                                key={d.slug}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    setDestQuery(d.name);
                                    setDestSelected(d.slug);
                                    setActive(null);
                                }}
                                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#eef3ec] transition-colors text-left"
                            >
                                <div className="size-8 rounded-full bg-[#eef3ec] flex items-center justify-center shrink-0">
                                    <MapPin size={15} className="text-[#6e8c79]" />
                                </div>
                                <div>
                                    <div className="text-[14px] font-semibold text-[#1a211c]">{d.name}</div>
                                    <div className="text-[12px] text-[#8a968d]">{d.country}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </Popover>
            )}

            {/* Dates calendar */}
            {active === 'dates' && (
                <Popover className="left-0">
                    <CalendarPanel
                        startDate={startDate}
                        endDate={endDate}
                        onSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
                        onClose={() => setActive(null)}
                        dateLocale={dateLocale}
                        dayLabels={DAY_LABELS}
                        t={t}
                    />
                </Popover>
            )}

            {/* Travelers counter */}
            {active === 'travelers' && (
                <Popover className="left-[calc(50%-100px)]">
                    <TravelersPanel
                        value={travelers}
                        onChange={setTravelers}
                        onClose={() => setActive(null)}
                        t={t}
                    />
                </Popover>
            )}

            {/* Experience selector */}
            {active === 'experience' && (
                <Popover className="right-[72px] w-[240px]">
                    <div className="py-2">
                        <button
                            onClick={() => { setExperience(''); setActive(null); }}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-[14px] font-medium transition-colors ${
                                experience === '' ? 'bg-[#eef3ec] text-[#6e8c79]' : 'text-[#1a211c] hover:bg-[#eef3ec]'
                            }`}
                        >
                            <Compass size={16} className="text-[#6e8c79] shrink-0" />
                            {t('search.all_experiences')}
                        </button>
                        {EXPERIENCES.map(ex => (
                            <button
                                key={ex.value}
                                onClick={() => { setExperience(ex.value); setActive(null); }}
                                className={`w-full flex items-center gap-3 px-5 py-3 text-[14px] font-medium transition-colors ${
                                    experience === ex.value
                                        ? 'bg-[#eef3ec] text-[#6e8c79]'
                                        : 'text-[#1a211c] hover:bg-[#eef3ec]'
                                }`}
                            >
                                <span className="text-base shrink-0">{ex.emoji}</span>
                                {t(ex.labelKey)}
                            </button>
                        ))}
                    </div>
                </Popover>
            )}
        </div>
    );
}
