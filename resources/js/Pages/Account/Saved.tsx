import { Head, Link, router, usePage } from '@inertiajs/react';
import AccountLayout from '../../Components/AccountLayout';
import { Star, Heart, MapPin } from 'lucide-react';
import type { Tour, PageProps } from '../../types';

interface Props {
    savedTours: Tour[];
}

export default function AccountSaved({ savedTours }: Props) {
    const { locale } = usePage<PageProps>().props;
    const fmt = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    function handleRemove(tourId: number) {
        router.post(`/wishlist/${tourId}`, {}, { preserveScroll: true });
    }

    return (
        <AccountLayout title="Saved safaris">
            <Head title="Saved safaris" />

            <h2 className="font-serif text-xl font-bold text-[#1F2937] mb-5">Saved Safaris</h2>

            {savedTours.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Heart size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg">No saved safaris yet.</p>
                    <Link href="/tours" className="mt-3 inline-block text-sm text-[#2C4A3B] underline">Explore safaris →</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedTours.map((tour) => (
                        <div key={tour.id} className="bg-white rounded-[16px] overflow-hidden shadow-sm flex flex-col sm:flex-row">
                            <div className="relative sm:w-56 aspect-[16/9] sm:aspect-auto flex-shrink-0">
                                <img
                                    src={tour.card_url || '/images/placeholder-safari.jpg'}
                                    alt={tour.title}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-[#1F2937] shadow">
                                    {tour.badge ?? 'Upcoming'}
                                </span>
                                <button
                                    onClick={() => handleRemove(tour.id)}
                                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                                >
                                    <Heart size={13} className="fill-[#E07A3F] text-[#E07A3F]" />
                                </button>
                            </div>
                            <div className="flex-1 p-4">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xs text-gray-400">Booking #GKS-48213</span>
                                    <div className="ml-auto flex items-center gap-1">
                                        <Star size={11} className="fill-[#E07A3F] text-[#E07A3F]" />
                                        <span className="text-xs font-semibold text-[#1F2937]">{tour.rating_cache?.toFixed(1)}</span>
                                    </div>
                                </div>

                                <h3 className="font-serif font-bold text-[#1F2937] text-base mb-1">{tour.title}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                    <MapPin size={10} />
                                    {tour.destination?.name}, {tour.destination?.country} · {tour.duration_days} days
                                </p>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(tour.inclusions ?? []).slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">{tag.type}</span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400">Total paid</p>
                                        <p className="font-bold text-[#1F2937]">{fmt(tour.base_price)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/${locale}/${tour.type === 'package' ? 'packages' : 'tours'}/${tour.slug}`} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-medium text-[#1F2937] hover:border-[#2C4A3B] transition-colors">
                                            View details
                                        </Link>
                                        <Link href={`/${locale}/${tour.type === 'package' ? 'packages' : 'tours'}/${tour.slug}`} className="px-4 py-2 rounded-full bg-[#2C4A3B] text-white text-xs font-semibold hover:bg-[#3a5c4a] transition-colors">
                                            Modify
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
