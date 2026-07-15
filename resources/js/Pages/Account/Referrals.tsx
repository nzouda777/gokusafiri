import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '../../Components/AccountLayout';
import { Gift, Copy, Check, Users, Wallet, Clock3 } from 'lucide-react';

interface Commission {
    id: number;
    booking_reference: string | null;
    amount: number;
    currency: string;
    status: 'earned' | 'paid' | 'cancelled';
    date: string;
}

interface Props {
    referral: {
        code: string;
        link: string;
        rate_percent: number;
        signups: number;
        earned_total: number;
        pending_total: number;
        paid_total: number;
        commissions: Commission[];
    };
}

export default function AccountReferrals({ referral }: Props) {
    const [copied, setCopied] = useState(false);
    const fmt = (cents: number) =>
        (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(referral.link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable — user can select the link manually
        }
    };

    const STATS = [
        { label: 'Friends referred', value: String(referral.signups), icon: Users },
        { label: 'Pending earnings', value: fmt(referral.pending_total), icon: Clock3 },
        { label: 'Paid out', value: fmt(referral.paid_total), icon: Wallet },
    ];

    return (
        <AccountLayout title="Referrals">
            <Head title="Referrals" />

            <h2 className="font-serif text-xl font-bold text-[#1F2937] mb-5">Refer & Earn</h2>

            {/* Referral link card */}
            <div className="bg-[#2C4A3B] rounded-[16px] p-6 mb-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Gift size={20} className="text-[#E07A3F]" />
                    </div>
                    <div>
                        <p className="font-semibold text-base">Earn {referral.rate_percent}% on every booking</p>
                        <p className="text-xs text-white/60">
                            Share your link — when someone signs up and books a safari, you earn {referral.rate_percent}% of every payment they make.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <input
                        readOnly
                        value={referral.link}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 rounded-[10px] bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none"
                    />
                    <button
                        onClick={copyLink}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E07A3F] text-white text-sm font-semibold hover:bg-[#c96a33] transition-colors"
                    >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        {copied ? 'Copied!' : 'Copy link'}
                    </button>
                </div>
                <p className="text-xs text-white/50 mt-3">Your code: <span className="font-mono font-semibold text-white/90">{referral.code}</span></p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {STATS.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-[16px] p-5 shadow-sm">
                        <Icon size={18} className="text-[#2C4A3B] mb-2" />
                        <p className="text-xl font-bold text-[#1F2937]">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            {/* Commission history */}
            <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-[#1F2937] text-sm">Commission history</h3>
                </div>
                {referral.commissions.length === 0 ? (
                    <div className="text-center py-14 text-gray-400">
                        <Gift size={28} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No commissions yet. Share your link to start earning!</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Booking</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referral.commissions.map((c) => (
                                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                                    <td className="px-5 py-3 text-gray-500">{c.date}</td>
                                    <td className="px-5 py-3 font-medium text-[#1F2937]">{c.booking_reference ?? '—'}</td>
                                    <td className="px-5 py-3 font-semibold text-[#1F2937]">{fmt(c.amount)}</td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                c.status === 'paid'
                                                    ? 'bg-[#eef3ec] text-[#2C4A3B]'
                                                    : c.status === 'earned'
                                                      ? 'bg-[#fff3eb] text-[#E07A3F]'
                                                      : 'bg-gray-100 text-gray-400'
                                            }`}
                                        >
                                            {c.status === 'earned' ? 'pending payout' : c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-4">
                Payouts are processed by our team once your pending earnings are confirmed. Contact support to arrange your payout method.
            </p>
        </AccountLayout>
    );
}
