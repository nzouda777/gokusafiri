import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { PageProps } from '../types';

interface Props {
    launch_date: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function useCountdown(target: string): TimeLeft {
    const calc = (): TimeLeft => {
        const diff = Math.max(0, new Date(target).getTime() - Date.now());
        return {
            days:    Math.floor(diff / 86_400_000),
            hours:   Math.floor((diff % 86_400_000) / 3_600_000),
            minutes: Math.floor((diff % 3_600_000) / 60_000),
            seconds: Math.floor((diff % 60_000) / 1_000),
        };
    };

    const [left, setLeft] = useState<TimeLeft>(calc);

    useEffect(() => {
        const id = setInterval(() => setLeft(calc()), 1_000);
        return () => clearInterval(id);
    }, [target]);

    return left;
}

function Pad({ n }: { n: number }) {
    return <>{String(n).padStart(2, '0')}</>;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div
                className="relative w-[52px] h-[52px] sm:w-[90px] sm:h-[90px] lg:w-[110px] lg:h-[110px] rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(240,160,94,0.25)' }}
            >
                <span className="font-display not-italic text-[32px] sm:text-[42px] lg:text-[52px] leading-none text-white tabular-nums">
                    <Pad n={value} />
                </span>
            </div>
            <span className="text-[11px] sm:text-[13px] font-hanken tracking-[2px] uppercase text-[#f0a05e]/70">
                {label}
            </span>
        </div>
    );
}

export default function ComingSoon({ launch_date }: Props) {
    const { flash } = usePage<PageProps>().props;
    const left = useCountdown(launch_date);
    const { data, setData, post, processing, errors, reset } = useForm({ email: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/coming-soon/subscribe', {
            onSuccess: () => reset('email'),
        });
    }

    const subscribed = !!(flash as Record<string, unknown>)?.subscribed;

    return (
        <>
            <Head title="Coming Soon — GokuSafiri" />

            {/* Full-screen hero */}
            <div className="relative min-h-screen flex flex-col overflow-hidden">

                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="/images/hero-safari.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Dark green gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(160deg, rgba(22,36,27,0.93) 0%, rgba(22,36,27,0.78) 45%, rgba(58,90,69,0.55) 100%)' }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col min-h-screen">

                    {/* Top bar */}
                    <header className="flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-7 sm:pt-10">
                        <img
                            src="/images/main-white.png"
                            alt="GokuSafiri"
                            className="h-10 sm:h-14 w-auto"
                        />
                        <span
                            className="text-[11px] font-hanken tracking-[2.5px] uppercase px-3.5 py-1.5 rounded-full"
                            style={{ background: 'rgba(240,160,94,0.18)', color: '#f0a05e', border: '1px solid rgba(240,160,94,0.35)' }}
                        >
                            Launching July 11
                        </span>
                    </header>

                    {/* Main content — vertically centered */}
                    <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 text-center py-16">

                        {/* Eyebrow */}
                        <p className="mb-5 sm:mb-7 text-[11px] sm:text-[13px] font-hanken tracking-[3px] uppercase text-[#f0a05e]">
                            Something wild is coming
                        </p>

                        {/* Headline */}
                        <h1 className="mb-4 sm:mb-6 max-w-[760px]">
                            <span className="block font-display not-italic text-[38px] sm:text-[54px] lg:text-[68px] leading-[1.08] tracking-[-0.5px] text-white">
                                Africa's finest safaris,
                            </span>
                            <span className="block font-display italic text-[38px] sm:text-[54px] lg:text-[68px] leading-[1.08] tracking-[-0.5px] text-[#f0a05e]">
                                curated for you.
                            </span>
                        </h1>

                        <p className="mb-10 sm:mb-14 max-w-[520px] text-[15px] sm:text-[17px] leading-[1.65] text-white/70 font-hanken">
                            Gorilla treks, coastal retreats, migration crossings hand-picked experiences across 14 countries, ready on July&nbsp;11th.
                        </p>

                        {/* Countdown */}
                        <div className="flex items-start gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
                            <CountdownBlock value={left.days}    label="Days" />
                            <div className="text-[28px] sm:text-[38px] lg:text-[48px] font-display text-white/40 mt-3 sm:mt-4 leading-none select-none">:</div>
                            <CountdownBlock value={left.hours}   label="Hours" />
                            <div className="text-[28px] sm:text-[38px] lg:text-[48px] font-display text-white/40 mt-3 sm:mt-4 leading-none select-none">:</div>
                            <CountdownBlock value={left.minutes} label="Minutes" />
                            <div className="text-[28px] sm:text-[38px] lg:text-[48px] font-display text-white/40 mt-3 sm:mt-4 leading-none select-none">:</div>
                            <CountdownBlock value={left.seconds} label="Seconds" />
                        </div>

                        {/* Email capture */}
                        {subscribed ? (
                            <div
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl mb-6"
                                style={{ background: 'rgba(110,140,121,0.25)', border: '1px solid rgba(110,140,121,0.5)' }}
                            >
                                <svg className="w-5 h-5 text-[#6e8c79] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-white font-hanken text-[15px]">
                                    You're on the list! We'll notify you on launch day.
                                </span>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="w-full max-w-[480px] mb-6">
                                <p className="text-white/60 font-hanken text-[13px] mb-3 tracking-wide">
                                    Get early access — be the first to book.
                                </p>
                                <div className="flex gap-2 sm:gap-3">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="flex-1 min-w-0 rounded-[10px] px-4 py-3.5 text-[15px] font-hanken text-[#16241b] placeholder-[#8a968d] outline-none focus:ring-2 focus:ring-[#f0a05e]/50"
                                        style={{ background: 'rgba(255,255,255,0.92)' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="shrink-0 px-5 py-3.5 rounded-[10px] text-[15px] font-hanken font-semibold text-white transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, #e07a3f 0%, #d9722a 100%)' }}
                                    >
                                        {processing ? 'Sending…' : 'Notify me'}
                                    </button>
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-[13px] text-[#f0a05e] font-hanken">{errors.email}</p>
                                )}
                            </form>
                        )}

                        {/* Trust bar */}
                        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
                            <TrustItem icon="shield" label="Free cancellation" />
                            <div className="hidden sm:block w-px h-4 bg-white/20" />
                            <TrustItem icon="star" label="Rated 4.9 / 5 by 120k+ travelers" />
                            <div className="hidden sm:block w-px h-4 bg-white/20" />
                            <TrustItem icon="globe" label="14 African countries" />
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="relative z-10 flex items-center justify-center px-6 pb-8 pt-4">
                        <p className="text-white/30 text-[12px] font-hanken">
                            © {new Date().getFullYear()} GokuSafiri. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}

function TrustItem({ icon, label }: { icon: string; label: string }) {
    const icons: Record<string, React.ReactElement> = {
        shield: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        star: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        globe: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
    };

    return (
        <div className="flex items-center gap-2 text-white/55">
            <span className="text-[#f0a05e]/70">{icons[icon]}</span>
            <span className="font-hanken text-[12px] sm:text-[13px] tracking-wide">{label}</span>
        </div>
    );
}
