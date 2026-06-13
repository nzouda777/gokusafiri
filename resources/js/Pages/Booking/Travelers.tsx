import { Head, useForm } from '@inertiajs/react';
import CheckoutLayout from '../../Components/CheckoutLayout';
import BookingSummary from '../../Components/BookingSummary';
import { useState } from 'react';
import type { Tour, TourSchedule, TourAddon } from '../../types';

interface TravelerForm {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    country_of_origin: string;
    passport_number: string;
}

interface Props {
    booking: {
        reference: string;
        tour: Tour;
        schedule: TourSchedule;
        travelers_count: number;
        lead?: {
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            date_of_birth: string;
            country_of_origin: string;
            passport_number: string;
        };
        travelers?: TravelerForm[];
        addons?: { addon: TourAddon; quantity: number }[];
        member_discount?: number;
        taxes?: number;
    };
}

// Common country list (ISO 2-letter codes)
const COUNTRIES = [
    { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' },
    { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
    { code: 'IT', name: 'Italy' }, { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' }, { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' }, { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' }, { code: 'DK', name: 'Denmark' },
    { code: 'KE', name: 'Kenya' }, { code: 'TZ', name: 'Tanzania' },
    { code: 'ZA', name: 'South Africa' }, { code: 'NG', name: 'Nigeria' },
    { code: 'JP', name: 'Japan' }, { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' }, { code: 'BR', name: 'Brazil' },
];

export default function BookingTravelers({ booking }: Props) {
    const { tour, schedule } = booking;
    const count = booking.travelers_count;

    const blankTraveler = (): TravelerForm => ({
        first_name: '', last_name: '', date_of_birth: '', country_of_origin: '', passport_number: '',
    });

    const { data, setData, post, processing, errors } = useForm<{
        lead: { first_name: string; last_name: string; email: string; phone: string; date_of_birth: string; country_of_origin: string; passport_number: string };
        travelers: TravelerForm[];
        special_request: string;
    }>({
        lead: {
            first_name:       booking.lead?.first_name ?? '',
            last_name:        booking.lead?.last_name ?? '',
            email:            booking.lead?.email ?? '',
            phone:            booking.lead?.phone ?? '',
            date_of_birth:    booking.lead?.date_of_birth ?? '',
            country_of_origin: booking.lead?.country_of_origin ?? '',
            passport_number:  booking.lead?.passport_number ?? '',
        },
        travelers: Array.from({ length: Math.max(0, count - 1) }, (_, i) =>
            booking.travelers?.[i] ?? blankTraveler()
        ),
        special_request: '',
    });

    const [sameAsLead, setSameAsLead] = useState<boolean[]>(
        Array(Math.max(0, count - 1)).fill(false)
    );

    function toggleSameAsLead(idx: number) {
        const next = [...sameAsLead];
        next[idx] = !next[idx];
        setSameAsLead(next);
        if (next[idx]) {
            const t = [...data.travelers];
            t[idx] = {
                first_name:       data.lead.first_name,
                last_name:        data.lead.last_name,
                date_of_birth:    data.lead.date_of_birth,
                country_of_origin: data.lead.country_of_origin,
                passport_number:  data.lead.passport_number,
            };
            setData('travelers', t);
        }
    }

    function setTraveler(idx: number, field: keyof TravelerForm, value: string) {
        const t = [...data.travelers];
        t[idx] = { ...t[idx], [field]: value };
        setData('travelers', t);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/booking/${booking.reference}/travelers`);
    }

    return (
        <CheckoutLayout step={2}>
            <Head title="Travelers details" />

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-[28px] items-start">

                    {/* ── Left column ─────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-[16px]">

                        {/* Page title */}
                        <div className="mb-[4px]">
                            <h1 className="font-display not-italic text-[32px] leading-[1.15] text-[#16241b]">
                                Travelers details
                            </h1>
                            <p className="text-[13px] text-[#8a968d] mt-[4px]">
                                Step 2 of 4 · No charge until you confirm payment
                            </p>
                        </div>

                        {/* ── Lead contact ─────────────────────── */}
                        <FormCard title="Lead contact">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                                <Field
                                    label="First name"
                                    value={data.lead.first_name}
                                    onChange={v => setData('lead', { ...data.lead, first_name: v })}
                                    placeholder="Jane"
                                    error={errors['lead.first_name']}
                                />
                                <Field
                                    label="Last name"
                                    value={data.lead.last_name}
                                    onChange={v => setData('lead', { ...data.lead, last_name: v })}
                                    placeholder="Doe"
                                    error={errors['lead.last_name']}
                                />
                                <Field
                                    label="Email"
                                    type="email"
                                    value={data.lead.email}
                                    onChange={v => setData('lead', { ...data.lead, email: v })}
                                    placeholder="jane@email.com"
                                    error={errors['lead.email']}
                                    className="sm:col-span-1"
                                />
                                {/* Phone with country code */}
                                <div>
                                    <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                        Phone
                                    </label>
                                    <div className="flex gap-[8px]">
                                        <select
                                            className="w-[90px] shrink-0 px-[10px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] bg-[#fbf8f2] text-[#16241b] focus:outline-none focus:border-[#2E4A39] appearance-none"
                                        >
                                            <option>🇺🇸 +1</option>
                                            <option>🇫🇷 +33</option>
                                            <option>🇬🇧 +44</option>
                                            <option>🇩🇪 +49</option>
                                        </select>
                                        <input
                                            type="tel"
                                            value={data.lead.phone}
                                            onChange={e => setData('lead', { ...data.lead, phone: e.target.value })}
                                            placeholder="+1 555 000 0000"
                                            className="flex-1 px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] bg-[#fbf8f2] text-[#16241b] focus:outline-none focus:border-[#2E4A39]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormCard>

                        {/* ── Additional travelers ─────────────── */}
                        {data.travelers.map((t, idx) => (
                            <FormCard
                                key={idx}
                                title={`Traveler ${idx + 2} (Adult)`}
                                action={
                                    <label className="flex items-center gap-[7px] cursor-pointer">
                                        <div
                                            onClick={() => toggleSameAsLead(idx)}
                                            className={`w-[16px] h-[16px] rounded-[4px] border-[1.5px] flex items-center justify-center cursor-pointer transition-colors ${
                                                sameAsLead[idx] ? 'bg-[#2E4A39] border-[#2E4A39]' : 'border-[#c5d3c8]'
                                            }`}
                                        >
                                            {sameAsLead[idx] && (
                                                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-[12px] text-[#4f5c53]">Same as lead contact</span>
                                    </label>
                                }
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                                    <Field
                                        label="First name"
                                        value={t.first_name}
                                        onChange={v => setTraveler(idx, 'first_name', v)}
                                        placeholder="Jane"
                                        disabled={sameAsLead[idx]}
                                    />
                                    <Field
                                        label="Last name"
                                        value={t.last_name}
                                        onChange={v => setTraveler(idx, 'last_name', v)}
                                        placeholder="Doe"
                                        disabled={sameAsLead[idx]}
                                    />
                                    <Field
                                        label="Date of birth"
                                        type="date"
                                        value={t.date_of_birth}
                                        onChange={v => setTraveler(idx, 'date_of_birth', v)}
                                        placeholder="DD/MM/YYYY"
                                        disabled={sameAsLead[idx]}
                                    />
                                    {/* Country dropdown */}
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                            Origin country
                                        </label>
                                        <select
                                            value={t.country_of_origin}
                                            onChange={e => setTraveler(idx, 'country_of_origin', e.target.value)}
                                            disabled={sameAsLead[idx]}
                                            className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] bg-[#fbf8f2] text-[#16241b] focus:outline-none focus:border-[#2E4A39] disabled:opacity-50"
                                        >
                                            <option value="">Select country</option>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Field
                                        label="Passport no"
                                        value={t.passport_number}
                                        onChange={v => setTraveler(idx, 'passport_number', v)}
                                        placeholder="AB123456"
                                        disabled={sameAsLead[idx]}
                                    />
                                </div>
                            </FormCard>
                        ))}

                        {/* ── Special request ───────────────────── */}
                        <FormCard title="Special request">
                            <textarea
                                value={data.special_request}
                                onChange={e => setData('special_request', e.target.value)}
                                rows={3}
                                placeholder="Dietary needs, accessibility requirements, celebrations…"
                                className="w-full px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] text-[13px] bg-[#fbf8f2] text-[#16241b] focus:outline-none focus:border-[#2E4A39] resize-none placeholder:text-[#b5bfb7]"
                            />
                        </FormCard>

                        {/* ── Navigation ────────────────────────── */}
                        <div className="flex items-center justify-between pt-[8px]">
                            <a
                                href={`/booking/${booking.reference}/dates`}
                                className="text-[13px] font-medium text-[#4f5c53] hover:text-[#2E4A39] transition-colors"
                            >
                                ← Back
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-[8px] px-[28px] py-[13px] rounded-full bg-[#2E4A39] text-white text-[14px] font-semibold hover:bg-[#1e3326] disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Saving…' : 'Continue to payment'} →
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Summary ───────────────────────── */}
                    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0">
                        <BookingSummary
                            tour={tour}
                            schedule={schedule}
                            travelers={booking.travelers_count}
                            addons={booking.addons}
                            memberDiscount={booking.member_discount}
                            taxes={booking.taxes}
                        />
                    </div>
                </div>
            </form>
        </CheckoutLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormCard({ title, action, children }: {
    title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-[18px] border border-[#e4ddd0] p-[22px]">
            <div className="flex items-center justify-between mb-[18px]">
                <h2 className="text-[15px] font-bold text-[#16241b]">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

function Field({
    label, value, onChange, error, type = 'text', placeholder, disabled, className = '',
}: {
    label: string; value: string; onChange: (v: string) => void;
    error?: string; type?: string; placeholder?: string; disabled?: boolean; className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-[12px] py-[11px] rounded-[10px] border border-[#e4ddd0] text-[13px] bg-[#fbf8f2] text-[#16241b] focus:outline-none focus:border-[#2E4A39] placeholder:text-[#b5bfb7] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && <p className="text-[11px] text-red-500 mt-[4px]">{error}</p>}
        </div>
    );
}
