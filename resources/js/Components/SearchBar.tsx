import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Search, MapPin, Calendar, Users, Compass,
    ChevronLeft, ChevronRight, Minus, Plus,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    eachDayOfInterval, getDay, isSameDay, isBefore, isAfter,
    startOfDay, isToday,
} from 'date-fns';

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

const EXPERIENCES = [
    { value: 'safari',    label: 'Safari',           emoji: '🦁' },
    { value: 'beach',     label: 'Beaches',          emoji: '🏖️' },
    { value: 'mountain',  label: 'Mountains',        emoji: '🏔️' },
    { value: 'culture',   label: 'Culture',          emoji: '🎭' },
    { value: 'gorilla',   label: 'Gorilla trekking', emoji: '🦍' },
    { value: 'honeymoon', label: 'Honeymoon',        emoji: '💑' },
];

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

type ActiveField = 'destination' | 'dates' | 'travelers' | 'experience' | null;

interface TravelerState { adults: number; children: number; infants: number }

interface Props {
    /** When true the bar sits inside a sticky container on the Tours page */
    sticky?: boolean;
    initialValues?: {
        destination?: string;
        dates?: string;
        travelers?: string;
        experience?: string;
    };
}

// ─── Popover shell — defined OUTSIDE SearchBar to avoid remounting ─────────────

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
}

function CalendarPanel({ startDate, endDate, onSelect, onClose }: CalendarProps) {
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
                                <span className="text-[13px] font-semibold text-[#1a211c]">
                                    {format(month, 'MMMM yyyy')}
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
                                {DAY_LABELS.map(d => (
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
                    Clear dates
                </button>
                <button
                    onClick={onClose}
                    disabled={!startDate}
                    className="px-4 py-2 bg-[#6e8c79] text-white text-[13px] font-semibold rounded-full hover:bg-[#5a7865] disabled:opacity-40 transition-colors"
                >
                    {startDate && !endDate ? 'Pick end date' : 'Apply'}
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
}

function TravelersPanel({ value, onChange, onClose }: TravelersPanelProps) {
    const rows: { key: keyof TravelerState; label: string; sub: string; min: number }[] = [
        { key: 'adults',   label: 'Adults',   sub: 'Age 13+',       min: 1 },
        { key: 'children', label: 'Children', sub: 'Age 2–12',      min: 0 },
        { key: 'infants',  label: 'Infants',  sub: 'Under 2, free', min: 0 },
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
                            <div className="text-[14px] font-semibold text-[#1a211c]">{row.label}</div>
                            <div className="text-[12px] text-[#8a968d] mt-0.5">{row.sub}</div>
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
                    Done
                </button>
            </div>
        </div>
    );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────

export default function SearchBar({ initialValues, sticky: _sticky }: Props) {
    const barRef = useRef<HTMLDivElement>(null);

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

    // Toggle a field open/close
    function toggle(field: ActiveField) {
        setActive(prev => (prev === field ? null : field));
    }

    // ── Derived display labels ────────────────────────────────────────────────

    const datesLabel = startDate
        ? endDate
            ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
            : `${format(startDate, 'MMM d')} →`
        : '';

    const travelersLabel = [
        travelers.adults   ? `${travelers.adults} adult${travelers.adults   > 1 ? 's' : ''}` : '',
        travelers.children ? `${travelers.children} child${travelers.children > 1 ? 'ren' : ''}` : '',
        travelers.infants  ? `${travelers.infants} infant${travelers.infants  > 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ');

    const expLabel = EXPERIENCES.find(e => e.value === experience)?.label ?? '';

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
        router.get('/tours', params);
    }

    // ── Shared styles ─────────────────────────────────────────────────────────
    const field = (f: ActiveField) =>
        `flex-1 min-w-0 px-[22px] py-[12px] flex flex-col gap-[3px] rounded-[100px] cursor-pointer transition-colors select-none
         ${active === f ? 'bg-[#eef3ec]' : 'hover:bg-[#f9f9f9]'}`;

    return (
        // barRef wraps the entire bar + its absolutely-positioned popovers
        <div ref={barRef} className="relative w-full">

            {/* ── Pill ─────────────────────────────────────────────────────── */}
            <div className="bg-white border border-[#d8d8d8] rounded-[100px]
                            shadow-[0px_7px_7.5px_rgba(0,0,0,0.05),0px_28px_14px_rgba(0,0,0,0.04),0px_63px_19px_rgba(0,0,0,0.03)]
                            flex items-center px-[10px] py-[8px] w-full">

                {/* Destination */}
                <div className={field('destination')} onClick={() => toggle('destination')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">Destination</span>
                    <input
                        type="text"
                        placeholder="Where to?"
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
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">Dates</span>
                    <span className={`text-[15px] leading-[22px] ${datesLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {datesLabel || 'Add dates'}
                    </span>
                </div>

                <div className="w-px h-[38px] bg-[#e4ddd0] shrink-0" />

                {/* Travelers */}
                <div className={field('travelers')} onClick={() => toggle('travelers')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">Travelers</span>
                    <span className={`text-[15px] leading-[22px] ${travelersLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {travelersLabel || '2 adults'}
                    </span>
                </div>

                <div className="w-px h-[38px] bg-[#e4ddd0] shrink-0" />

                {/* Experience */}
                <div className={field('experience')} onClick={() => toggle('experience')}>
                    <span className="text-[11px] font-bold text-[#8a968d] tracking-[1.1px] uppercase">Experience</span>
                    <span className={`text-[15px] leading-[22px] ${expLabel ? 'text-[#1a211c]' : 'text-[#8a968d]'}`}>
                        {expLabel || 'Any'}
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
                            <div className="px-5 py-4 text-[13px] text-[#8a968d]">No destinations found</div>
                        ) : filtered.map(d => (
                            <button
                                key={d.slug}
                                onMouseDown={e => e.preventDefault()} // prevent blur before click
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
                            All experiences
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
                                {ex.label}
                            </button>
                        ))}
                    </div>
                </Popover>
            )}
        </div>
    );
}
