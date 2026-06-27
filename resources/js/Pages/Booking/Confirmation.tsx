import { Head, Link, usePage } from '@inertiajs/react';
import CheckoutLayout from '../../Components/CheckoutLayout';
import { CheckCircle2, Mail, FileText, Backpack, MapPin, Download } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourAddon, PageProps } from '../../types';

interface Props {
    booking: {
        reference: string;
        tour: Tour;
        schedule: TourSchedule;
        travelers_count: number;
        lead_email: string;
        addons?: { addon: TourAddon; quantity: number }[];
        member_discount?: number;
        taxes?: number;
        total_amount: number;
        deposit_amount: number;
        cancellation_deadline?: string;
    };
}

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BookingConfirmation({ booking }: Props) {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const { tour, schedule } = booking;

    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';

    const dateLabel = schedule
        ? `${new Date(schedule.start_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })} – ${new Date(schedule.end_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`
        : null;

    const perPerson   = tour.base_price;
    const subtotal    = perPerson * booking.travelers_count;
    const addonsTotal = booking.addons?.reduce((s, a) => s + a.addon.price * (a.addon.per === 'person' ? a.quantity : 1), 0) ?? 0;

    const travelersLabel = booking.travelers_count !== 1
        ? `${booking.travelers_count} ${t('summary.adults')}`
        : `${booking.travelers_count} ${t('summary.adult')}`;

    const nextSteps = [
        {
            n: 1,
            icon: <Mail size={16} />,
            title: t('confirm.step1_title'),
            desc:  t('confirm.step1_desc'),
        },
        {
            n: 2,
            icon: <FileText size={16} />,
            title: t('confirm.step2_title'),
            desc:  t('confirm.step2_desc'),
        },
        {
            n: 3,
            icon: <Backpack size={16} />,
            title: t('confirm.step3_title'),
            desc:  t('confirm.step3_desc'),
        },
    ];

    return (
        <CheckoutLayout step={4}>
            <Head title={t('confirm.title')} />

            <div className="flex flex-col lg:flex-row gap-[28px] items-start">

                {/* ── Left ──────────────────────────────────── */}
                <div className="flex-1 min-w-0">

                    {/* Success hero */}
                    <div className="text-center mb-[32px]">
                        <div className="w-[80px] h-[80px] rounded-full bg-[#eef3ec] flex items-center justify-center mx-auto mb-[20px]">
                            <CheckCircle2 size={40} className="text-[#2E4A39]" strokeWidth={1.5} />
                        </div>
                        <h1 className="font-display not-italic text-[36px] leading-[1.15] text-[#16241b] mb-[8px]">
                            {t('confirm.title')}
                        </h1>
                        <p className="text-[14px] text-[#4f5c53]">
                            {t('confirm.subtitle', { ref: booking.reference, email: booking.lead_email })}
                        </p>
                        <p className="text-[13px] text-[#8a968d] mt-[4px]">
                            {t('confirm.specialist')}
                        </p>
                    </div>

                    {/* What happens next */}
                    <div className="bg-white rounded-[18px] border border-[#e4ddd0] p-[24px] mb-[20px]">
                        <h2 className="text-[15px] font-bold text-[#16241b] mb-[20px]">
                            {t('confirm.next_steps')}
                        </h2>
                        <div className="space-y-[20px]">
                            {nextSteps.map(step => (
                                <div key={step.n} className="flex items-start gap-[14px]">
                                    <div className="w-[34px] h-[34px] rounded-full bg-[#2E4A39] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                                        {step.n}
                                    </div>
                                    <div className="pt-[2px]">
                                        <p className="text-[14px] font-semibold text-[#16241b]">{step.title}</p>
                                        <p className="text-[13px] text-[#8a968d] mt-[2px]">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row gap-[12px]">
                        <Link
                            href="/account/trips"
                            className="flex-1 flex items-center justify-center py-[14px] rounded-full bg-[#2E4A39] text-white text-[14px] font-semibold hover:bg-[#1e3326] transition-colors"
                        >
                            {t('confirm.view_trips')}
                        </Link>
                        {/* <a
                            href={`/booking/${booking.reference}/itinerary.pdf`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-[8px] py-[14px] rounded-full border-[1.5px] border-[#2E4A39] text-[#2E4A39] text-[14px] font-semibold hover:bg-[#eef3ec] transition-colors"
                        >
                            <Download size={14} />
                            {t('confirm.download_pdf')}
                        </a> */}
                    </div>
                </div>

                {/* ── Right: Trip summary card ──────────────── */}
                <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
                    <div className="bg-white rounded-[20px] border border-[#e4ddd0] overflow-hidden sticky top-[120px]">

                        {/* Tour image */}
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src={tour.card_url || '/images/placeholder-safari.jpg'}
                                alt={typeof tour.title === 'string' ? tour.title : ''}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-[20px]">
                            {/* Tour info */}
                            <h3 className="font-display not-italic text-[16px] leading-[1.3] text-[#16241b] mb-[4px]">
                                {typeof tour.title === 'string' ? tour.title : ''}
                            </h3>
                            {tour.destination && (
                                <p className="flex items-center gap-[5px] text-[12px] text-[#8a968d] mb-[14px]">
                                    <MapPin size={11} className="shrink-0" />
                                    {tour.destination.name}, {tour.destination.country}
                                </p>
                            )}

                            {/* Dates + travelers */}
                            <div className="pt-[14px] border-t border-[#f0ede8] space-y-[8px]">
                                {dateLabel && (
                                    <div className="flex justify-between text-[13px]">
                                        <span className="text-[#8a968d]">{t('summary.dates')}</span>
                                        <span className="font-semibold text-[#16241b]">{dateLabel}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-[#8a968d]">{t('summary.travelers')}</span>
                                    <span className="font-semibold text-[#16241b]">{travelersLabel}</span>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="mt-[14px] pt-[14px] border-t border-[#f0ede8] space-y-[8px]">
                                <PriceLine label={`${fmt(perPerson)} × ${booking.travelers_count}`} amount={subtotal} />
                                {booking.addons?.map(a => (
                                    <PriceLine
                                        key={a.addon.id}
                                        label={a.addon.name}
                                        amount={a.addon.price * (a.addon.per === 'person' ? a.quantity : 1)}
                                    />
                                ))}
                                {(booking.member_discount ?? 0) > 0 && (
                                    <PriceLine label={t('summary.member_saving')} amount={-(booking.member_discount!)} accent />
                                )}
                                {(booking.taxes ?? 0) > 0 && (
                                    <PriceLine label={t('summary.taxes')} amount={booking.taxes!} />
                                )}
                            </div>

                            {/* Total paid */}
                            <div className="mt-[14px] pt-[14px] border-t border-[#e4ddd0] flex justify-between items-baseline">
                                <span className="text-[14px] font-bold text-[#16241b]">{t('summary.total_paid')}</span>
                                <span className="text-[20px] font-bold text-[#16241b]">{fmt(booking.total_amount)}</span>
                            </div>

                            {/* Free cancellation */}
                            {booking.cancellation_deadline && (
                                <div className="mt-[12px] flex items-start gap-[8px] bg-[#eef3ec] rounded-[12px] px-[12px] py-[10px]">
                                    <CheckCircle2 size={13} className="text-[#2E4A39] mt-[1px] shrink-0" />
                                    <p className="text-[12px] text-[#2E4A39] font-medium leading-[1.4]">
                                        {t('confirm.free_cancel', {
                                            date: new Date(booking.cancellation_deadline).toLocaleDateString(dateLocale, {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CheckoutLayout>
    );
}

function PriceLine({ label, amount, accent }: { label: string; amount: number; accent?: boolean }) {
    return (
        <div className="flex justify-between items-center text-[13px]">
            <span className={accent ? 'text-[#E07A3F]' : 'text-[#4f5c53]'}>{label}</span>
            <span className={`font-medium ${accent ? 'text-[#E07A3F]' : 'text-[#16241b]'}`}>
                {amount < 0 ? `–$${(Math.abs(amount) / 100).toLocaleString()}` : `$${(amount / 100).toLocaleString()}`}
            </span>
        </div>
    );
}
