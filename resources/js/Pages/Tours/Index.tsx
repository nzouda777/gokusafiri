import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import SearchBar from '../../Components/SearchBar';
import TourCard from '../../Components/TourCard';
import {
    SlidersHorizontal, ChevronLeft, ChevronRight, Star,
    X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, PaginatedData } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
    sort?: string;
    min_price?: number;
    max_price?: number;
    duration?: string[];
    region?: string[];
    style?: string[];
    rating?: string;
    q?: string;
    destination?: string;
    quick?: string[];
    experience?: string;
}

interface Props {
    tours: PaginatedData<Tour>;
    filters: Filters;
    totalCount: number;
    isPackages: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToursIndex({ tours, filters, totalCount, isPackages }: Props) {
    const { t } = useLaravelReactI18n();
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const basePath = isPackages ? '/packages' : '/tours';

    const SORT_OPTIONS = [
        { value: 'recommended', label: t('index.sort_recommended') },
        { value: 'price_asc',   label: t('index.sort_price_low') },
        { value: 'price_desc',  label: t('index.sort_price_high') },
        { value: 'rating',      label: t('index.sort_rating') },
        { value: 'duration',    label: t('index.sort_duration') },
    ];

    const QUICK_FILTERS = [
        { value: 'deals',       label: t('index.qf_deals'),       emoji: '🏷️' },
        { value: 'best_value',  label: t('index.qf_best_value'),  emoji: '⭐' },
        { value: 'free_cancel', label: t('index.qf_free_cancel'), emoji: '✅' },
        { value: 'small_group', label: t('index.qf_small_group'), emoji: '👥' },
    ];

    const DURATION_OPTIONS = [
        { value: '1-3',  label: t('index.dur_1_3') },
        { value: '4-7',  label: t('index.dur_4_7') },
        { value: '8-14', label: t('index.dur_8_14') },
        { value: '15+',  label: t('index.dur_15') },
    ];

    const REGIONS = [
        { value: 'east',     label: t('index.region_east') },
        { value: 'southern', label: t('index.region_southern') },
        { value: 'north',    label: t('index.region_north') },
        { value: 'west',     label: t('index.region_west') },
        { value: 'central',  label: t('index.region_central') },
    ];

    const STYLES = [
        { value: 'safari',    label: t('index.style_safari'),    emoji: '🦁' },
        { value: 'beach',     label: t('index.style_beach'),     emoji: '🏖️' },
        { value: 'mountain',  label: t('index.style_mountain'),  emoji: '🏔️' },
        { value: 'culture',   label: t('index.style_culture'),   emoji: '🎭' },
        { value: 'gorilla',   label: t('index.style_gorilla'),   emoji: '🦍' },
        { value: 'honeymoon', label: t('index.style_honeymoon'), emoji: '💑' },
    ];

    const RATING_OPTIONS = [
        { value: '4.5+', label: t('index.rating_4_5') },
        { value: '4.0+', label: t('index.rating_4_0') },
        { value: '3.5+', label: t('index.rating_3_5') },
    ];

    function applyFilter(newFilters: Partial<Filters>) {
        const merged = { ...localFilters, ...newFilters };
        // strip undefined / empty arrays
        const clean = Object.fromEntries(
            Object.entries(merged).filter(([, v]) =>
                v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
            )
        ) as Filters;
        setLocalFilters(clean);
        router.get(basePath, clean as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function toggleArray(key: 'duration' | 'region' | 'style' | 'quick', value: string) {
        const arr = (localFilters[key] ?? []) as string[];
        const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
        applyFilter({ [key]: next.length ? next : undefined });
    }

    function clearAll() {
        setLocalFilters({});
        router.get(basePath);
    }

    const activeCount = [
        localFilters.destination,
        localFilters.q,
        localFilters.rating,
        localFilters.max_price,
        ...(localFilters.duration ?? []),
        ...(localFilters.region ?? []),
        ...(localFilters.style ?? []),
        ...(localFilters.quick ?? []),
    ].filter(Boolean).length;

    return (
        <AppLayout>
            <Head title={isPackages ? t('index.title_packages') : t('index.title_safaris')} />

            {/* ── Sticky SearchBar strip ──────────────────────────────── */}
            <div className="md:sticky top-[71px] z-30 bg-[#fbf8f2] border-b border-[#e4ddd0] py-[14px]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <SearchBar
                        sticky
                        initialValues={{
                            destination: localFilters.destination ?? localFilters.q,
                            experience:  localFilters.style?.[0] ?? localFilters.experience,
                        }}
                    />
                </div>
            </div>

            {/* ── Page body ──────────────────────────────────────────── */}
            <div className="bg-[#fbf8f2] min-h-screen">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 pt-[40px] pb-[100px]">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-[6px] text-[13px] text-[#8a968d] mb-[24px]">
                        <Link href="/" className="hover:text-[#2E4A39] transition-colors">{t('index.breadcrumb_home')}</Link>
                        <span className="text-[#c5d3c8]">›</span>
                        <span className="text-[#16241b] font-medium">
                            {isPackages ? t('index.all_packages') : t('index.all_safaris')}
                        </span>
                    </nav>

                    {/* Page title */}
                    <div className="mb-[32px]">
                        <h1 className="font-display not-italic text-[26px] leading-[1.2] sm:text-[38px] tracking-[-0.38px] text-[#16241b] mb-[6px]">
                            {isPackages ? t('index.title_packages') : t('index.title_safaris')}
                        </h1>
                        <p className="text-[14px] text-[#8a968d]">
                            <span className="font-semibold text-[#16241b]">{totalCount}</span>
                            {' '}{isPackages ? t('index.packages_label') : t('index.tours_label')}
                            {' '}·{' '}
                            <span className="text-[#6e8c79] font-medium">{t('index.free_cancel')}</span>
                        </p>
                    </div>

                    {/* ── Sort pills + quick filters ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-[10px] mb-[28px]">

                        {/* Sort */}
                        <div className="flex items-center gap-[6px] flex-wrap">
                            {SORT_OPTIONS.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => applyFilter({ sort: s.value })}
                                    className={`px-[16px] py-[8px] rounded-full text-[13px] font-medium transition-colors border ${
                                        (localFilters.sort ?? 'recommended') === s.value
                                            ? 'bg-[#2E4A39] text-white border-[#2E4A39]'
                                            : 'bg-white text-[#16241b] border-[#e4ddd0] hover:border-[#2E4A39] hover:text-[#2E4A39]'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Quick filters */}
                        <div className="flex items-center gap-[6px] flex-wrap sm:ml-auto">
                            {QUICK_FILTERS.map(f => {
                                const isActive = localFilters.quick?.includes(f.value);
                                return (
                                    <button
                                        key={f.value}
                                        onClick={() => toggleArray('quick', f.value)}
                                        className={`flex items-center gap-[5px] px-[14px] py-[8px] rounded-full text-[13px] font-medium transition-colors border ${
                                            isActive
                                                ? 'bg-[#f0a05e] text-white border-[#f0a05e]'
                                                : 'bg-white text-[#4f5c53] border-[#e4ddd0] hover:border-[#f0a05e] hover:text-[#f0a05e]'
                                        }`}
                                    >
                                        <span className="text-[13px]">{f.emoji}</span>
                                        {f.label}
                                    </button>
                                );
                            })}

                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setMobileFiltersOpen(o => !o)}
                                className="lg:hidden flex items-center gap-[6px] px-[14px] py-[8px] rounded-full bg-white text-[#16241b] border border-[#e4ddd0] text-[13px] font-medium hover:border-[#2E4A39]"
                            >
                                <SlidersHorizontal size={14} />
                                {t('index.filters')} {activeCount > 0 && (
                                    <span className="bg-[#2E4A39] text-white text-[11px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                                        {activeCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Main layout ── */}
                    <div className="flex gap-[32px] items-start">

                        {/* Mobile overlay */}
                        {mobileFiltersOpen && (
                            <div
                                className="lg:hidden fixed inset-0 z-40 bg-black/40"
                                onClick={() => setMobileFiltersOpen(false)}
                            />
                        )}

                        {/* ── Sidebar ── */}
                        <aside className={[
                            // Mobile: fixed bottom sheet, slides in/out
                            'fixed bottom-0 left-0 right-0 z-50',
                            'transition-transform duration-300 ease-out',
                            mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full',
                            // Desktop: sticky sidebar in flow
                            'lg:static lg:translate-y-0 lg:z-auto',
                            'lg:w-[260px] lg:shrink-0',
                            'lg:sticky lg:top-[calc(71px+60px)]',
                            'lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto',
                        ].join(' ')}>
                            <div className="bg-white rounded-t-[24px] lg:rounded-[22px] border border-[#e4ddd0] p-[24px] max-h-[82vh] overflow-y-auto lg:max-h-none">

                                {/* Drag handle (mobile only) */}
                                <div className="lg:hidden flex justify-center mb-[16px] -mt-[8px]">
                                    <div className="w-10 h-1 bg-[#e4ddd0] rounded-full" />
                                </div>

                                {/* Sidebar header */}
                                <div className="flex items-center justify-between mb-[20px]">
                                    <h3 className="text-[14px] font-bold text-[#16241b]">{t('index.filters')}</h3>
                                    <div className="flex items-center gap-[12px]">
                                        {activeCount > 0 && (
                                            <button
                                                onClick={clearAll}
                                                className="flex items-center gap-[4px] text-[12px] text-[#f0a05e] font-medium hover:text-[#c97b4b] transition-colors"
                                            >
                                                <X size={12} />
                                                {t('index.clear_all')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setMobileFiltersOpen(false)}
                                            className="lg:hidden p-[4px] text-[#8a968d] hover:text-[#16241b] transition-colors"
                                            aria-label="Close filters"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Active chips */}
                                {activeCount > 0 && (
                                    <div className="flex flex-wrap gap-[6px] mb-[20px] pb-[20px] border-b border-[#e4ddd0]">
                                        {Object.entries(localFilters).flatMap(([key, val]) =>
                                            Array.isArray(val)
                                                ? val.map(v => ({ key, val: v }))
                                                : val ? [{ key, val: String(val) }] : []
                                        ).map(({ key, val }) => (
                                            <span
                                                key={`${key}-${val}`}
                                                className="flex items-center gap-[5px] px-[10px] py-[4px] rounded-full bg-[#eef3ec] text-[12px] text-[#2E4A39] font-medium"
                                            >
                                                {val}
                                                <button
                                                    onClick={() => {
                                                        const cur = localFilters[key as keyof Filters];
                                                        if (Array.isArray(cur)) {
                                                            applyFilter({ [key]: cur.filter(v => v !== val) });
                                                        } else {
                                                            applyFilter({ [key]: undefined });
                                                        }
                                                    }}
                                                    className="text-[#6e8c79] hover:text-[#2E4A39] ml-[1px]"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-[22px]">

                                    {/* Price range */}
                                    <SidebarSection title={t('index.price_range')}>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1000000}
                                            step={10000}
                                            value={localFilters.max_price ?? 1000000}
                                            onChange={e => applyFilter({ max_price: Number(e.target.value) })}
                                            className="w-full h-[3px] accent-[#2E4A39] cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[12px] text-[#8a968d] mt-[6px]">
                                            <span>$0</span>
                                            <span className="font-semibold text-[#16241b]">
                                                {localFilters.max_price
                                                    ? `$${(localFilters.max_price / 100).toLocaleString()}`
                                                    : t('index.any_price')
                                                }
                                            </span>
                                        </div>
                                    </SidebarSection>

                                    {/* Trip length */}
                                    <SidebarSection title={t('index.trip_length')}>
                                        {DURATION_OPTIONS.map(d => (
                                            <CheckRow
                                                key={d.value}
                                                label={d.label}
                                                checked={localFilters.duration?.includes(d.value) ?? false}
                                                onChange={() => toggleArray('duration', d.value)}
                                            />
                                        ))}
                                    </SidebarSection>

                                    {/* Region */}
                                    <SidebarSection title={t('index.region')}>
                                        {REGIONS.map(r => (
                                            <CheckRow
                                                key={r.value}
                                                label={r.label}
                                                checked={localFilters.region?.includes(r.value) ?? false}
                                                onChange={() => toggleArray('region', r.value)}
                                            />
                                        ))}
                                    </SidebarSection>

                                    {/* Style */}
                                    <SidebarSection title={t('index.style')}>
                                        {STYLES.map(s => (
                                            <CheckRow
                                                key={s.value}
                                                label={`${s.emoji} ${s.label}`}
                                                checked={localFilters.style?.includes(s.value) ?? false}
                                                onChange={() => toggleArray('style', s.value)}
                                            />
                                        ))}
                                    </SidebarSection>

                                    {/* Rating */}
                                    <SidebarSection title={t('index.min_rating')}>
                                        {RATING_OPTIONS.map(r => (
                                            <label
                                                key={r.value}
                                                className="flex items-center gap-[10px] cursor-pointer py-[4px] group"
                                            >
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={localFilters.rating === r.value}
                                                    onChange={() => applyFilter({ rating: r.value })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                                                    localFilters.rating === r.value
                                                        ? 'border-[#2E4A39] bg-[#2E4A39]'
                                                        : 'border-[#c5d3c8] group-hover:border-[#2E4A39]'
                                                }`}>
                                                    {localFilters.rating === r.value && (
                                                        <div className="w-[6px] h-[6px] rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-[4px]">
                                                    <Star size={12} className="fill-[#f0a05e] text-[#f0a05e]" />
                                                    <span className="text-[13px] text-[#16241b] font-medium">{r.label}</span>
                                                </div>
                                            </label>
                                        ))}
                                        {localFilters.rating && (
                                            <button
                                                onClick={() => applyFilter({ rating: undefined })}
                                                className="text-[12px] text-[#8a968d] hover:text-[#16241b] mt-[4px] transition-colors"
                                            >
                                                {t('index.clear_rating')}
                                            </button>
                                        )}
                                    </SidebarSection>
                                </div>

                                {/* Mobile apply button */}
                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="lg:hidden mt-[20px] w-full py-[14px] bg-[#2E4A39] text-white text-[14px] font-semibold rounded-full hover:bg-[#1e3326] transition-colors"
                                >
                                    {t('index.show_results')} {activeCount > 0 && `(${activeCount})`}
                                </button>
                            </div>
                        </aside>

                        {/* ── Tour grid ── */}
                        <div className="flex-1 min-w-0">
                            {tours.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-[80px] text-center">
                                    <div className="text-[48px] mb-[16px]">🔍</div>
                                    <h3 className="font-display not-italic text-[24px] text-[#16241b] mb-[8px]">
                                        {t('index.no_results_title', { type: isPackages ? t('index.packages_label') : t('index.tours_label') })}
                                    </h3>
                                    <p className="text-[14px] text-[#8a968d] mb-[24px]">
                                        {t('index.no_results_body')}
                                    </p>
                                    <button
                                        onClick={clearAll}
                                        className="px-[24px] py-[12px] rounded-full bg-[#2E4A39] text-white text-[14px] font-medium hover:bg-[#1e3326] transition-colors"
                                    >
                                        {t('index.clear_all_filters')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Result count */}
                                    <p className="text-[13px] text-[#8a968d] mb-[20px]">
                                        {t('index.results', { from: tours.from, to: tours.to, total: tours.total })}
                                    </p>

                                    {/* Grid */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
                                        {tours.data.map(tour => (
                                            <TourCard key={tour.id} tour={tour} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {tours.last_page > 1 && (
                                        <div className="flex items-center justify-center gap-[8px] mt-[48px]">
                                            {tours.current_page > 1 ? (
                                                <button
                                                    onClick={() => applyFilter({ ...localFilters })}
                                                    className="w-[40px] h-[40px] rounded-full border border-[#e4ddd0] bg-white flex items-center justify-center hover:border-[#2E4A39] hover:text-[#2E4A39] transition-colors text-[#8a968d]"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                            ) : (
                                                <div className="w-[40px] h-[40px]" />
                                            )}

                                            {Array.from({ length: tours.last_page }, (_, i) => i + 1)
                                                .filter(p => Math.abs(p - tours.current_page) <= 2 || p === 1 || p === tours.last_page)
                                                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                                                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, i) =>
                                                    p === '…' ? (
                                                        <span key={`gap-${i}`} className="text-[#8a968d] px-[2px]">…</span>
                                                    ) : (
                                                        <Link
                                                            key={p}
                                                            href={`${basePath}?page=${p}`}
                                                            className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${
                                                                p === tours.current_page
                                                                    ? 'bg-[#2E4A39] text-white'
                                                                    : 'bg-white border border-[#e4ddd0] text-[#16241b] hover:border-[#2E4A39] hover:text-[#2E4A39]'
                                                            }`}
                                                        >
                                                            {p}
                                                        </Link>
                                                    )
                                                )}

                                            {tours.current_page < tours.last_page ? (
                                                <Link
                                                    href={`${basePath}?page=${tours.current_page + 1}`}
                                                    className="w-[40px] h-[40px] rounded-full border border-[#e4ddd0] bg-white flex items-center justify-center hover:border-[#2E4A39] hover:text-[#2E4A39] transition-colors text-[#8a968d]"
                                                >
                                                    <ChevronRight size={16} />
                                                </Link>
                                            ) : (
                                                <div className="w-[40px] h-[40px]" />
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-t border-[#f0ede8] pt-[20px]">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-between w-full mb-[12px] group"
            >
                <span className="text-[12px] font-bold tracking-[1.2px] uppercase text-[#8a968d] group-hover:text-[#16241b] transition-colors">
                    {title}
                </span>
                {open
                    ? <ChevronUp size={14} className="text-[#8a968d]" />
                    : <ChevronDown size={14} className="text-[#8a968d]" />
                }
            </button>
            {open && <div className="space-y-[2px]">{children}</div>}
        </div>
    );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex items-center gap-[10px] cursor-pointer py-[5px] group">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-[16px] h-[16px] rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                checked
                    ? 'bg-[#2E4A39] border-[#2E4A39]'
                    : 'border-[#c5d3c8] group-hover:border-[#2E4A39]'
            }`}>
                {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </div>
            <span className={`text-[13px] leading-[20px] transition-colors ${checked ? 'text-[#16241b] font-medium' : 'text-[#4f5c53] group-hover:text-[#16241b]'}`}>
                {label}
            </span>
        </label>
    );
}
