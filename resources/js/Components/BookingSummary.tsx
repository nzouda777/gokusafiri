import { MapPin, CheckCircle2 } from 'lucide-react';
import type { Tour, TourSchedule, TourAddon } from '../types';

interface Props {
    tour: Tour;
    schedule?: TourSchedule | null;
    travelers?: number;
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
    tour, schedule, travelers = 1, addons = [], memberDiscount = 0, taxes = 0,
    total, depositAmount, showDeposit, showPaid,
}: Props) {
    const perPerson   = tour.base_price;
    const subtotal    = perPerson * travelers;
    const addonsTotal = addons.reduce((s, a) => s + a.addon.price * (a.addon.per === 'person' ? a.quantity : 1), 0);
    const computed    = total ?? (subtotal + addonsTotal - memberDiscount + taxes);

    const dateLabel = schedule
        ? `${new Date(schedule.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(schedule.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : null;

    const cancelDate = schedule && tour.cancellation_days
        ? new Date(new Date(schedule.start_date).getTime() - tour.cancellation_days * 86400000)
              .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    const displayAmount = showDeposit && depositAmount ? depositAmount : computed;

    return (
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
                {(dateLabel || travelers) && (
                    <div className="mt-[14px] pt-[14px] border-t border-[#f0ede8] space-y-[7px]">
                        {dateLabel && (
                            <div className="flex justify-between text-[13px]">
                                <span className="text-[#8a968d]">Dates</span>
                                <span className="font-semibold text-[#16241b]">{dateLabel}</span>
                            </div>
                        )}
                        {travelers > 0 && (
                            <div className="flex justify-between text-[13px]">
                                <span className="text-[#8a968d]">Travelers</span>
                                <span className="font-semibold text-[#16241b]">
                                    {travelers} adult{travelers !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Price breakdown */}
                <div className="mt-[14px] pt-[14px] border-t border-[#f0ede8] space-y-[8px]">
                    {travelers > 0 && (
                        <Line label={`${fmt(perPerson)} × ${travelers}`} amount={subtotal} />
                    )}
                    {addons.map(a => (
                        <Line
                            key={a.addon.id}
                            label={a.addon.name}
                            amount={a.addon.price * (a.addon.per === 'person' ? a.quantity : 1)}
                        />
                    ))}
                    {memberDiscount > 0 && (
                        <Line label="Member saving (5%)" amount={-memberDiscount} accent />
                    )}
                    {taxes > 0 && (
                        <Line label="Taxes & fees" amount={taxes} />
                    )}
                </div>

                {/* Total */}
                <div className="mt-[14px] pt-[14px] border-t border-[#e4ddd0] flex justify-between items-baseline">
                    <span className="text-[14px] font-bold text-[#16241b]">
                        {showPaid ? 'Total paid' : showDeposit ? 'Due today (20%)' : 'Total'}
                    </span>
                    <span className="text-[20px] font-bold text-[#16241b]">
                        {fmt(displayAmount)}
                    </span>
                </div>

                {/* Cancellation notice */}
                {cancelDate && (
                    <div className="mt-[12px] flex items-start gap-[8px] bg-[#eef3ec] rounded-[12px] px-[12px] py-[10px]">
                        <CheckCircle2 size={13} className="text-[#2E4A39] mt-[1px] shrink-0" />
                        <p className="text-[12px] text-[#2E4A39] font-medium leading-[1.4]">
                            Free cancellation until {cancelDate}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Line({ label, amount, accent }: { label: string; amount: number; accent?: boolean }) {
    const color = accent ? 'text-[#E07A3F]' : 'text-[#4f5c53]';
    const valColor = accent ? 'text-[#E07A3F]' : 'text-[#16241b]';
    return (
        <div className="flex justify-between items-center text-[13px]">
            <span className={color}>{label}</span>
            <span className={`font-medium ${valColor}`}>
                {amount < 0 ? `–${fmt(Math.abs(amount))}` : fmt(amount)}
            </span>
        </div>
    );
}
