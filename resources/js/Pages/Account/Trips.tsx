import { Head, Link, router, usePage } from '@inertiajs/react';
import AccountLayout from '../../Components/AccountLayout';
import { Star, MapPin, Calendar, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Booking, PageProps } from '../../types';

interface Stats {
    upcoming: number;
    completed: number;
    countries: number;
    tier: string;
}

interface NextDeparture {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    days_to_go: number;
    reference: string;
    card_url?: string;
}

interface Props {
    bookings: Booking[];
    stats: Stats;
    next_departure?: NextDeparture;
    tab?: 'upcoming' | 'past' | 'cancelled';
}

const TABS = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past trips' },
    { key: 'cancelled', label: 'Cancelled' },
];

export default function AccountTrips({ bookings, stats, next_departure, tab = 'upcoming' }: Props) {
    const { locale } = usePage<PageProps>().props;

    const fmt = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    function switchTab(key: string) {
        router.get('/account/trips', { tab: key }, { preserveScroll: false, replace: true });
    }

    return (
        <AccountLayout title="My trips">
            <Head title="My trips" />

            <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl font-bold text-[#1F2937]">My trips</h2>
                <Link
                    href={`/${locale}/tours`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2C4A3B] text-white text-sm font-semibold hover:bg-[#3a5c4a] transition-colors"
                >
                    + New Safari
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { val: stats.upcoming, label: 'Upcoming' },
                    { val: stats.completed, label: 'Completed' },
                    { val: stats.countries, label: 'Countries' },
                    { val: stats.tier, label: 'Tier', highlight: true },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-[16px] p-4 shadow-sm text-center">
                        <p className={`font-serif text-2xl font-bold ${s.highlight ? 'text-[#E07A3F]' : 'text-[#1F2937]'}`}>{s.val}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Next departure banner */}
            {next_departure && (
                <div className="bg-[#2C4A3B] text-white rounded-[16px] p-4 mb-6 flex items-center gap-4">
                    {next_departure.card_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={next_departure.card_url} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 font-medium mb-0.5">Next departure</p>
                        <p className="font-serif font-bold text-base">{next_departure.title}</p>
                        <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {next_departure.destination} · {new Date(next_departure.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–{new Date(next_departure.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                            <span className="text-[#E07A3F] font-semibold">{next_departure.days_to_go} days to go</span>
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button className="px-4 py-2 rounded-full border border-white/30 text-xs font-medium hover:bg-white/10 transition-colors">
                            Contact Guide
                        </button>
                        <Link href={`/booking/${next_departure.reference}/itinerary.pdf`} className="px-4 py-2 rounded-full bg-white text-[#2C4A3B] text-xs font-semibold hover:bg-gray-100 transition-colors">
                            View Itinerary
                        </Link>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-0 border-b border-gray-200 mb-5">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => switchTab(t.key)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            tab === t.key
                                ? 'border-[#2C4A3B] text-[#2C4A3B]'
                                : 'border-transparent text-gray-500 hover:text-[#1F2937]'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Booking cards */}
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Calendar size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="text-lg">No {tab} trips.</p>
                        <Link href={`/${locale}/tours`} className="mt-3 inline-block text-sm text-[#2C4A3B] underline">Browse safaris →</Link>
                    </div>
                ) : bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} fmt={fmt} />
                ))}
            </div>
        </AccountLayout>
    );
}

function BookingCard({ booking, fmt }: { booking: Booking; fmt: (c: number) => string }) {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const STATUS_LABEL: Record<string, string> = {
        confirmed:    'Confirmed',
        deposit_paid: 'Deposit paid',
        pending:      'Pending payment',
        completed:    'Completed',
        cancelled:    'Cancelled',
        expired:      'Expired',
    };
    const STATUS_COLOR: Record<string, string> = {
        confirmed:    'bg-green-100 text-green-700',
        deposit_paid: 'bg-blue-100 text-blue-700',
        pending:      'bg-yellow-100 text-yellow-700',
        completed:    'bg-gray-100 text-gray-600',
        cancelled:    'bg-red-100 text-red-600',
        expired:      'bg-gray-100 text-gray-500',
    };

    const inclusions = Array.isArray(booking.tour?.inclusions) ? booking.tour.inclusions : [];

    function handleCancel() {
        setCancelling(true);
        router.post(`/trips/${booking.reference}/cancel`, {}, {
            preserveScroll: true,
            onFinish: () => { setCancelling(false); setConfirmCancel(false); },
        });
    }

    const deadlineLabel = booking.cancellation_deadline
        ? new Date(booking.cancellation_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <div className="bg-white rounded-[16px] overflow-hidden shadow-sm flex flex-col sm:flex-row">
            <div className="relative sm:w-56 aspect-[16/9] sm:aspect-auto flex-shrink-0">
                <img
                    src={booking.tour?.card_url || '/images/tours/serengeti.jpg'}
                    alt={booking.tour?.title}
                    className="w-full h-full object-cover"
                />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow ${STATUS_COLOR[booking.status] ?? 'bg-white text-[#1F2937]'}`}>
                    {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
            </div>

            <div className="flex-1 p-4 flex flex-col">
                <div className="mb-1">
                    <p className="text-xs text-gray-400 mb-0.5">Booking #{booking.reference}</p>
                    <div className="flex items-center gap-1">
                        <Star size={11} className="fill-[#E07A3F] text-[#E07A3F]" />
                        <span className="text-xs font-semibold text-[#1F2937]">{booking.tour?.rating_cache?.toFixed(1) ?? '–'}</span>
                    </div>
                </div>

                <h3 className="font-serif font-bold text-[#1F2937] text-base mb-1">{booking.tour?.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin size={10} />
                    {booking.tour?.destination?.name}, {booking.tour?.destination?.country} · {booking.tour?.duration_days} days
                </p>

                {booking.schedule && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                        <Calendar size={10} />
                        {new Date(booking.schedule.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' – '}
                        {new Date(booking.schedule.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                )}

                {/* Cancellation deadline info */}
                {deadlineLabel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <p className={`text-xs mb-2 flex items-center gap-1 ${booking.can_cancel ? 'text-[#2C4A3B]' : 'text-red-500'}`}>
                        <XCircle size={10} className="shrink-0" />
                        {booking.can_cancel
                            ? `Free cancellation until ${deadlineLabel}`
                            : `Cancellation closed (deadline: ${deadlineLabel})`}
                    </p>
                )}

                {/* Tags */}
                {inclusions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {inclusions.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">{tag.type}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-[#1F2937]">{fmt(booking.total_amount ?? 0)}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Cancel confirmation inline */}
                        {confirmCancel ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Cancel this booking?</span>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                                </button>
                                <button
                                    onClick={() => setConfirmCancel(false)}
                                    className="px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors"
                                >
                                    Keep
                                </button>
                            </div>
                        ) : (
                            <>
                                {booking.can_cancel && (
                                    <button
                                        onClick={() => setConfirmCancel(true)}
                                        className="px-3 py-2 rounded-full border border-red-200 text-xs font-medium text-red-500 hover:border-red-400 hover:bg-red-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <Link
                                    href={`/booking/${booking.reference}/confirmation`}
                                    className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-[#1F2937] hover:border-[#2C4A3B] transition-colors"
                                >
                                    View details
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
