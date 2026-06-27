import { Head, router, usePage } from '@inertiajs/react';
import CheckoutLayout from '../../Components/CheckoutLayout';
import BookingSummary from '../../Components/BookingSummary';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Lock, ShieldCheck } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour, TourSchedule, TourAddon, PageProps } from '../../types';

interface BookingData {
    reference: string;
    tour: Tour;
    schedule: TourSchedule;
    travelers_count: number;
    addons?: { addon: TourAddon; quantity: number }[];
    member_discount?: number;
    taxes?: number;
    total_amount: number;
    deposit_amount: number;
    balance_amount: number;
    balance_due_date?: string;
    payment_plan: 'full' | 'deposit';
}

interface Props {
    booking: BookingData;
    client_secret: string | null;
}

const STRIPE_STYLE = {
    style: {
        base: {
            fontSize: '13px',
            color: '#16241b',
            fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
            fontWeight: '400',
            '::placeholder': { color: '#b5bfb7' },
        },
        invalid: { color: '#dc2626' },
    },
};

function fmt(cents: number) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BookingPayment({ booking, client_secret }: Props) {
    const { stripe_key } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const stripePromise = stripe_key ? loadStripe(stripe_key) : null;

    if (!stripePromise) {
        return (
            <CheckoutLayout step={3}>
                <Head title={t('payment.title')} />
                <div className="text-center py-20 text-[#8a968d]">
                    <p className="text-[14px]">Payment configuration missing. Please contact support.</p>
                </div>
            </CheckoutLayout>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm booking={booking} initialClientSecret={client_secret} />
        </Elements>
    );
}

// ─── Inner form ────────────────────────────────────────────────────────────────

function PaymentForm({ booking, initialClientSecret }: { booking: BookingData; initialClientSecret: string | null }) {
    const stripe   = useStripe();
    const elements = useElements();
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();

    const dateLocale = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' }[locale] ?? 'en-US';

    const [plan, setPlan]                 = useState<'full' | 'deposit'>(booking.payment_plan ?? 'deposit');
    const [clientSecret, setClientSecret] = useState<string | null>(initialClientSecret);
    const [switchingPlan, setSwitchingPlan] = useState(false);
    const [nameOnCard, setNameOnCard]     = useState('');
    const [agreeTerms, setAgreeTerms]     = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [cardError, setCardError]       = useState<string | null>(null);

    const amountToday = plan === 'full' ? booking.total_amount : booking.deposit_amount;
    const fullSaving  = Math.round(booking.total_amount * 0.02);
    const returnUrl   = `${window.location.origin}/booking/${booking.reference}/payment/complete`;

    const balanceDueDateFormatted = booking.balance_due_date
        ? new Date(booking.balance_due_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })
        : t('payment.default_due');

    async function switchPlanFn(newPlan: 'full' | 'deposit') {
        if (newPlan === plan || switchingPlan) return;
        setSwitchingPlan(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const res  = await fetch(`/booking/${booking.reference}/payment/plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                body: JSON.stringify({ plan: newPlan }),
            });
            const json = await res.json();
            setPlan(newPlan);
            setClientSecret(json.client_secret);
        } catch {
            // keep previous plan on failure
        } finally {
            setSwitchingPlan(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!stripe || !elements || !agreeTerms || !clientSecret || submitting) return;

        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) return;

        setSubmitting(true);
        setCardError(null);

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumber,
                billing_details: { name: nameOnCard },
            },
            return_url: returnUrl,
        });

        if (error) {
            setCardError(error.message ?? 'Payment failed. Please check your card details.');
            setSubmitting(false);
            return;
        }

        router.visit(`/booking/${booking.reference}/payment/complete?payment_intent=${paymentIntent?.id}&redirect_status=${paymentIntent?.status ?? 'succeeded'}`);
    }

    const { tour, schedule } = booking;

    return (
        <CheckoutLayout step={3}>
            <Head title={t('payment.title')} />

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-[28px] items-start">

                    {/* ── Left column ─────────────────────────── */}
                    <div className="flex-1 min-w-0 space-y-[16px]">

                        {/* Page title */}
                        <div className="mb-[4px]">
                            <h1 className="font-display not-italic text-[32px] leading-[1.15] text-[#16241b]">
                                {t('payment.title')}
                            </h1>
                            <p className="text-[13px] text-[#8a968d] mt-[4px] flex items-center gap-[5px]">
                                <Lock size={11} />
                                {t('payment.step_hint')}
                            </p>
                        </div>

                        {/* ── How would you like to pay? ─────── */}
                        <div className="bg-white rounded-[18px] border border-[#e4ddd0] p-[22px]">
                            <h2 className="text-[15px] font-bold text-[#16241b] mb-[14px]">
                                {t('payment.how_pay')}
                            </h2>
                            <div className="space-y-[10px]">

                                {/* Pay in full */}
                                <label className={`flex items-start gap-[12px] p-[16px] rounded-[14px] border-[1.5px] cursor-pointer transition-all ${
                                    plan === 'full'
                                        ? 'border-[#2E4A39] bg-[#eef3ec]'
                                        : 'border-[#e4ddd0] bg-white hover:border-[#c5d3c8]'
                                } ${switchingPlan ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <input type="radio" name="plan" checked={plan === 'full'}
                                        onChange={() => switchPlanFn('full')} className="sr-only" />
                                    <Radio active={plan === 'full'} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-[8px]">
                                            <span className="text-[14px] font-bold text-[#16241b]">{t('payment.pay_full')}</span>
                                            <span className="text-[12px] font-semibold text-white bg-[#2E4A39] px-[8px] py-[2px] rounded-full">
                                                {t('payment.full_today', { amount: fmt(booking.total_amount) })}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-[#8a968d] mt-[3px]">
                                            {t('payment.full_saving', { amount: fmt(fullSaving) })}
                                        </p>
                                    </div>
                                </label>

                                {/* Reserve with deposit */}
                                <label className={`flex items-start gap-[12px] p-[16px] rounded-[14px] border-[1.5px] cursor-pointer transition-all ${
                                    plan === 'deposit'
                                        ? 'border-[#2E4A39] bg-[#eef3ec]'
                                        : 'border-[#e4ddd0] bg-white hover:border-[#c5d3c8]'
                                } ${switchingPlan ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <input type="radio" name="plan" checked={plan === 'deposit'}
                                        onChange={() => switchPlanFn('deposit')} className="sr-only" />
                                    <Radio active={plan === 'deposit'} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-[8px]">
                                            <span className="text-[14px] font-bold text-[#16241b]">{t('payment.pay_deposit')}</span>
                                            <span className="text-[12px] font-semibold text-[#E07A3F] bg-[#E07A3F]/10 px-[8px] py-[2px] rounded-full">
                                                {t('payment.deposit_pct')}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-[#8a968d] mt-[3px]">
                                            {t('payment.deposit_desc', {
                                                deposit: fmt(booking.deposit_amount),
                                                balance: fmt(booking.balance_amount),
                                                date: balanceDueDateFormatted,
                                            })}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* ── Card details ─────────────────────── */}
                        <div className="bg-white rounded-[18px] border border-[#e4ddd0] p-[22px]">
                            <div className="flex items-center justify-between mb-[18px]">
                                <h2 className="text-[15px] font-bold text-[#16241b]">{t('payment.card_details')}</h2>
                                <div className="flex items-center gap-[6px]">
                                    {['Visa', 'MC', 'Amex'].map(b => (
                                        <span key={b} className="text-[10px] font-bold text-[#8a968d] bg-[#f0ede8] px-[6px] py-[2px] rounded-[4px]">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-[14px]">
                                {/* Card number */}
                                <div>
                                    <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                        {t('payment.card_number')}
                                    </label>
                                    <div className="px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] bg-[#fbf8f2] focus-within:border-[#2E4A39] transition-colors">
                                        <CardNumberElement options={STRIPE_STYLE} />
                                    </div>
                                </div>

                                {/* Expiry | CVV | Postal */}
                                <div className="grid grid-cols-3 gap-[10px]">
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                            {t('payment.expiry')}
                                        </label>
                                        <div className="px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] bg-[#fbf8f2] focus-within:border-[#2E4A39] transition-colors">
                                            <CardExpiryElement options={STRIPE_STYLE} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                            {t('payment.cvv')}
                                        </label>
                                        <div className="px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] bg-[#fbf8f2] focus-within:border-[#2E4A39] transition-colors">
                                            <CardCvcElement options={STRIPE_STYLE} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                            {t('payment.postal')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="12345"
                                            className="w-full px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] bg-[#fbf8f2] text-[13px] text-[#16241b] placeholder:text-[#b5bfb7] focus:outline-none focus:border-[#2E4A39] transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Name on card */}
                                <div>
                                    <label className="block text-[11px] font-bold tracking-[1px] uppercase text-[#8a968d] mb-[7px]">
                                        {t('payment.name_card')}
                                    </label>
                                    <input
                                        type="text"
                                        value={nameOnCard}
                                        onChange={e => setNameOnCard(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full px-[14px] py-[12px] rounded-[10px] border border-[#e4ddd0] bg-[#fbf8f2] text-[13px] text-[#16241b] placeholder:text-[#b5bfb7] focus:outline-none focus:border-[#2E4A39] transition-colors"
                                    />
                                </div>

                                {/* Billing address */}
                                <CheckboxRow label={t('payment.billing_same')} defaultChecked />
                            </div>

                            {/* Card error */}
                            {cardError && (
                                <div className="mt-[14px] px-[14px] py-[10px] rounded-[12px] bg-red-50 border border-red-100">
                                    <p className="text-[13px] text-red-600">{cardError}</p>
                                </div>
                            )}
                        </div>

                        {/* ── Terms ────────────────────────────── */}
                        <CheckboxRow
                            label={
                                <>
                                    {t('payment.terms_prefix')}{' '}
                                    <a href="#" className="text-[#2E4A39] underline underline-offset-2">{t('payment.terms_booking')}</a>
                                    {', '}
                                    <a href="#" className="text-[#2E4A39] underline underline-offset-2">{t('payment.terms_cancel')}</a>
                                    {' '}{t('payment.terms_and')}{' '}
                                    <a href="#" className="text-[#2E4A39] underline underline-offset-2">{t('payment.terms_privacy')}</a>
                                    {'.'}
                                </>
                            }
                            checked={agreeTerms}
                            onChange={() => setAgreeTerms(v => !v)}
                        />

                        {/* ── Trust signals ─────────────────────── */}
                        <div className="flex items-center gap-[20px] py-[2px]">
                            <span className="flex items-center gap-[5px] text-[12px] text-[#8a968d]">
                                <ShieldCheck size={13} className="text-[#2E4A39]" />
                                {t('payment.secured_stripe')}
                            </span>
                            <span className="flex items-center gap-[5px] text-[12px] text-[#8a968d]">
                                <Lock size={12} className="text-[#2E4A39]" />
                                {t('payment.ssl')}
                            </span>
                        </div>

                        {/* ── Navigation ────────────────────────── */}
                        <div className="flex items-center justify-between pt-[8px]">
                            <a
                                href={`/booking/${booking.reference}/travelers`}
                                className="text-[13px] font-medium text-[#4f5c53] hover:text-[#2E4A39] transition-colors"
                            >
                                {t('payment.back')}
                            </a>
                            <button
                                type="submit"
                                disabled={submitting || !stripe || !agreeTerms || switchingPlan}
                                className="flex items-center gap-[8px] px-[28px] py-[13px] rounded-full bg-[#2E4A39] text-white text-[14px] font-semibold hover:bg-[#1e3326] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Lock size={13} />
                                {submitting ? t('payment.processing') : `${t('payment.submit')} →`}
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
                            showDeposit={plan === 'deposit'}
                            depositAmount={booking.deposit_amount}
                            total={booking.total_amount}
                        />
                    </div>
                </div>
            </form>
        </CheckoutLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Radio({ active }: { active: boolean }) {
    return (
        <div className={`mt-[1px] w-[18px] h-[18px] rounded-full border-[1.5px] shrink-0 flex items-center justify-center transition-colors ${
            active ? 'border-[#2E4A39]' : 'border-[#c5d3c8]'
        }`}>
            {active && <div className="w-[8px] h-[8px] rounded-full bg-[#2E4A39]" />}
        </div>
    );
}

function CheckboxRow({ label, checked, onChange, defaultChecked }: {
    label: React.ReactNode; checked?: boolean; onChange?: () => void; defaultChecked?: boolean;
}) {
    const [internal, setInternal] = useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked    = isControlled ? checked : internal;
    const toggle       = onChange ?? (() => setInternal(v => !v));

    return (
        <label className="flex items-start gap-[10px] cursor-pointer">
            <div
                onClick={toggle}
                className={`mt-[1px] w-[16px] h-[16px] rounded-[4px] border-[1.5px] shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                    isChecked ? 'bg-[#2E4A39] border-[#2E4A39]' : 'border-[#c5d3c8]'
                }`}
            >
                {isChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </div>
            <span className="text-[13px] text-[#4f5c53] leading-[20px]">{label}</span>
        </label>
    );
}
