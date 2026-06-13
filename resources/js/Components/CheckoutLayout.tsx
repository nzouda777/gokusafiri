import { Link, usePage } from '@inertiajs/react';
import { Lock, CheckCircle2 } from 'lucide-react';
import type { PageProps } from '../types';

const STEPS = [
    { n: 1, label: 'Trip & dates' },
    { n: 2, label: 'Travelers details' },
    { n: 3, label: 'Payment' },
    { n: 4, label: 'Confirmation' },
];

export default function CheckoutLayout({ children, step }: { children: React.ReactNode; step: number }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7f5]">

            {/* ── Header ──────────────────────────────────────────── */}
            <header className="bg-white border-b border-[#e4ddd0] h-[68px] flex items-center shrink-0 z-20">
                <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-[8px]">
                        <img
                            src="/images/logo.svg"
                            alt="GokuSafiri"
                            className="h-[34px] w-auto"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="font-display not-italic text-[20px] text-[#2E4A39] font-semibold">
                            GokuSafiri
                        </span>
                    </Link>

                    {/* Secure checkout badge */}
                    <div className="flex items-center gap-[6px] text-[13px] text-[#8a968d] font-medium">
                        <Lock size={13} className="text-[#2E4A39]" />
                        Secure checkout
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-[12px]">
                        {auth.user ? (
                            <span className="text-[13px] text-[#4f5c53]">{auth.user.name}</span>
                        ) : (
                            <Link href="/login" className="text-[13px] text-[#4f5c53] hover:text-[#2E4A39] transition-colors">
                                Sign in
                            </Link>
                        )}
                        <Link
                            href="/tours"
                            className="px-[18px] py-[8px] rounded-full bg-[#2E4A39] text-white text-[13px] font-semibold hover:bg-[#1e3326] transition-colors"
                        >
                            Plan my trip
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Stepper ─────────────────────────────────────────── */}
            <div className="bg-white border-b border-[#e4ddd0] py-[16px] shrink-0">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="flex items-center justify-center">
                        {STEPS.map((s, idx) => {
                            const done    = s.n < step;
                            const current = s.n === step;
                            return (
                                <div key={s.n} className="flex items-center">
                                    {/* Step indicator */}
                                    <div className="flex flex-col items-center gap-[5px]">
                                        <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                                            done    ? 'bg-[#2E4A39] text-white' :
                                            current ? 'bg-[#E07A3F] text-white' :
                                                      'bg-[#e4ddd0] text-[#8a968d]'
                                        }`}>
                                            {done ? <CheckCircle2 size={15} className="text-white" /> : s.n}
                                        </div>
                                        <span className={`text-[11px] font-medium hidden sm:block whitespace-nowrap ${
                                            current ? 'text-[#16241b]' : done ? 'text-[#2E4A39]' : 'text-[#8a968d]'
                                        }`}>
                                            {s.label}
                                        </span>
                                    </div>

                                    {/* Connector line */}
                                    {idx < STEPS.length - 1 && (
                                        <div className={`w-[60px] sm:w-[100px] h-[1.5px] mx-[8px] mb-[18px] transition-colors ${
                                            s.n < step ? 'bg-[#2E4A39]' : 'bg-[#e4ddd0]'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Page content ────────────────────────────────────── */}
            <main className="flex-1 py-[40px]">
                <div className="max-w-[1200px] mx-auto px-6">
                    {children}
                </div>
            </main>

            {/* ── Checkout footer ─────────────────────────────────── */}
            <footer className="bg-[#16241b] text-white">
                <div className="max-w-[1200px] mx-auto px-6 py-[40px]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <span className="font-display not-italic text-[18px] font-semibold">GokuSafiri</span>
                            <p className="mt-[10px] text-[13px] text-white/60 leading-[1.6]">
                                Crafting unforgettable African journeys since 2011. Local expertise, responsible travel, and the trip of a lifetime — every time.
                            </p>
                        </div>
                        {[
                            { title: 'Explore',  links: ['Safaris', 'Beaches', 'Mountains', 'Custom trips'] },
                            { title: 'Company',  links: ['About us', 'Our guides', 'Sustainability', 'Careers'] },
                            { title: 'Support',  links: ['Help center', 'Contact us', 'Cancellation policy', 'Travel insurance'] },
                        ].map(col => (
                            <div key={col.title}>
                                <h4 className="text-[12px] font-bold uppercase tracking-[1.2px] text-white/50 mb-[14px]">{col.title}</h4>
                                <ul className="space-y-[8px]">
                                    {col.links.map(l => (
                                        <li key={l}>
                                            <a href="#" className="text-[13px] text-white/60 hover:text-white transition-colors">{l}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-[1200px] mx-auto px-6 py-[16px] flex flex-col sm:flex-row justify-between text-[12px] text-white/40 gap-2">
                        <span>© 2026 Gokusafiri. All rights reserved.</span>
                        <div className="flex gap-[16px]">
                            <a href="#" className="hover:text-white/70">Privacy</a>
                            <a href="#" className="hover:text-white/70">Terms</a>
                            <a href="#" className="hover:text-white/70">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
