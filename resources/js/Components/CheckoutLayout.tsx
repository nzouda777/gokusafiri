import { Link, usePage } from '@inertiajs/react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../types';

export default function CheckoutLayout({ children, step }: { children: React.ReactNode; step: number }) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();

    const STEPS = [
        { n: 1, labelKey: 'checkout.step1' },
        { n: 2, labelKey: 'checkout.step2' },
        { n: 3, labelKey: 'checkout.step3' },
        { n: 4, labelKey: 'checkout.step4' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7f5]">

            {/* ── Header ──────────────────────────────────────────── */}
            <header className="bg-white border-b border-[#e4ddd0] h-[68px] flex items-center shrink-0 z-20">
                <div className="max-w-[1200px] w-full mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-[8px]">
                        <img
                            src="/images/main-logo.png"
                            alt="GokuSafiri"
                            className="h-[34px] md:h-[64px] w-auto"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                        />
                        {/* <span className="font-display not-italic text-[20px] text-[#2E4A39] font-semibold">
                            GokuSafiri
                        </span> */}
                    </Link>

                    {/* Secure checkout badge */}
                    <div className="flex items-center gap-[6px] text-[13px] text-[#8a968d] font-medium">
                        <Lock size={13} className="text-[#2E4A39]" />
                        <span className="hidden sm:block">{t('checkout.secure')}</span>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-[12px]">
                        {auth.user ? (
                            <span className="hidden sm:block text-[13px] text-[#4f5c53]">{auth.user.name}</span>
                        ) : (
                            <Link href={`/${locale}/login`} className="hidden sm:block text-[13px] text-[#4f5c53] hover:text-[#2E4A39] transition-colors">
                                {t('nav.sign_in')}
                            </Link>
                        )}
                        <Link
                            href={`/${locale}/tours`}
                            className="hidden sm:inline-flex px-[18px] py-[8px] rounded-full bg-[#2E4A39] text-white text-[13px] font-semibold hover:bg-[#1e3326] transition-colors"
                        >
                            {t('nav.plan_trip')}
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
                                            {t(s.labelKey)}
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
                            <img 
                                 src="/images/logo-white.png"
                                alt="Gokusafiri"
                                className="h-10 w-auto  "
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                            />
                            {/* <span className="font-display not-italic text-[18px] font-semibold">GokuSafiri</span> */}
                            <p className="mt-[10px] text-[13px] text-white/60 leading-[1.6]">
                                {t('footer.tagline')}
                            </p>
                        </div>
                        {[
                            { titleKey: 'footer.explore',  links: ['footer.safaris', 'footer.beaches', 'footer.mountains', 'footer.custom'] },
                            { titleKey: 'footer.company',  links: ['footer.about', 'footer.guides', 'footer.sustainability', 'footer.careers'] },
                            { titleKey: 'footer.support',  links: ['footer.help', 'footer.contact', 'footer.cancel_policy', 'footer.insurance'] },
                        ].map(col => (
                            <div key={col.titleKey}>
                                <h4 className="text-[12px] font-bold uppercase tracking-[1.2px] text-white/50 mb-[14px]">{t(col.titleKey)}</h4>
                                <ul className="space-y-[8px]">
                                    {col.links.map(lk => (
                                        <li key={lk}>
                                            <a href="#" className="text-[13px] text-white/60 hover:text-white transition-colors">{t(lk)}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="max-w-[1200px] mx-auto px-6 py-[16px] flex flex-col sm:flex-row justify-between text-[12px] text-white/40 gap-2">
                        <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
                        <div className="flex gap-[16px]">
                            <a href="#" className="hover:text-white/70">{t('footer.privacy')}</a>
                            <a href="#" className="hover:text-white/70">{t('footer.terms')}</a>
                            <a href="#" className="hover:text-white/70">{t('footer.cookies')}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
