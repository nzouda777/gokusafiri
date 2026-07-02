import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../types';

interface Props {
    faqs: { q: string; a: string }[];
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-[18px] overflow-hidden border transition-colors ${open ? 'border-[#c5d3c8]' : 'border-[rgba(0,0,0,0.06)]'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-[18px] text-left gap-4 bg-white"
            >
                <span className="text-[15px] font-medium text-[#16241b] leading-[22px]">{q}</span>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-[#2e4a39]' : 'bg-[#eef3ec]'}`}>
                    {open
                        ? <ChevronUp size={13} className="text-white" />
                        : <ChevronDown size={13} className="text-[#6e8c79]" />
                    }
                </div>
            </button>
            {open && (
                <div className="px-6 pb-[18px] text-[14px] text-[#4f5c53] leading-[22px] bg-white border-t border-[#e4ddd0]">
                    <div className="pt-3">{a}</div>
                </div>
            )}
        </div>
    );
}

export default function FAQ({ faqs }: Props) {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    const staticFaqs = [
        { q: t('faq.q1'), a: t('faq.a1') },
        { q: t('faq.q2'), a: t('faq.a2') },
        { q: t('faq.q3'), a: t('faq.a3') },
        { q: t('faq.q4'), a: t('faq.a4') },
        { q: t('faq.q5'), a: t('faq.a5') },
        { q: t('faq.q6'), a: t('faq.a6') },
        { q: t('faq.q7'), a: t('faq.a7') },
        { q: t('faq.q8'), a: t('faq.a8') },
        { q: t('faq.q9'), a: t('faq.a9') },
        { q: t('faq.q10'), a: t('faq.a10') },
    ];

    const allFaqs = faqs.length > 0 ? faqs : staticFaqs;

    return (
        <AppLayout>
            <Head title="FAQ  Gokusafiri" />

            {/* Hero */}
            <section className="bg-[#fbf8f2] border-b border-[#e4ddd0] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[600px]">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                            {t('faq.eyebrow')}
                        </p>
                        <h1 className="font-display not-italic text-[40px] leading-[48px] md:text-[60px] md:leading-[66px] tracking-[-0.62px] text-[#16241b] mb-5">
                            {t('faq.title')}
                        </h1>
                        <p className="text-[16px] leading-[26px] text-[#4f5c53] max-w-[480px]">
                            {t('faq.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ list */}
            <section className="bg-[#fbf8f2] py-12 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="flex flex-col lg:flex-row gap-10 md:gap-16 xl:gap-20 items-start">

                        {/* Left sticky panel */}
                        <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 lg:sticky lg:top-24">
                            <div className="bg-white rounded-[20px] p-7">
                                <h2 className="font-semibold text-[16px] text-[#16241b] mb-3">{t('faq.sidebar_title')}</h2>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53] mb-5">
                                    {t('faq.sidebar_desc')}
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href="mailto:hello@gokusafiri.com"
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-[12px] bg-[#6e8c79] text-white text-[14px] font-medium hover:bg-[#5a7865] transition-colors"
                                    >
                                        {t('faq.email_team')}
                                        <ArrowRight size={16} />
                                    </a>
                                    <Link
                                        href={`${p}/contact`}
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-[12px] border border-[#e4ddd0] text-[#16241b] text-[14px] font-medium hover:border-[#6e8c79] transition-colors"
                                    >
                                        {t('faq.all_contact')}
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-5 bg-white rounded-[20px] p-7">
                                <p className="text-[13px] text-[#8a968d] mb-3">{t('faq.quick_links')}</p>
                                <ul className="space-y-2.5">
                                    {[
                                        { label: t('faq.link_cancel'), href: `${p}/cancellation-policy` },
                                        // { label: t('faq.link_insurance'), href: `${p}/travel-insurance` },
                                        { label: t('faq.link_help'), href: `${p}/help` },
                                        { label: t('faq.link_safaris'), href: `${p}/tours` },
                                    ].map(({ label, href }) => (
                                        <li key={label}>
                                            <Link href={href} className="text-[14px] text-[#6e8c79] hover:text-[#2e4a39] transition-colors">
                                                {label} →
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* FAQ items */}
                        <div className="flex-1 space-y-3">
                            {allFaqs.map((faq, i) => (
                                <FaqItem key={i} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#16241b] py-14">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <h2 className="font-display not-italic text-[28px] md:text-[40px] tracking-[-0.62px] text-white mb-4">
                        {t('faq.cta_title')}
                    </h2>
                    <p className="text-[15px] text-white/60 mb-8 max-w-[380px] mx-auto">
                        {t('faq.cta_subtitle')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={`${p}/tours`}
                            className="px-[28px] py-[14px] rounded-full bg-[#6e8c79] text-white text-[15px] font-medium hover:bg-[#5a7865] transition-colors"
                        >
                            {t('faq.cta_explore')}
                        </Link>
                        <a
                            href="mailto:hello@gokusafiri.com"
                            className="px-[28px] py-[14px] rounded-full border border-white/30 text-white text-[15px] font-medium hover:bg-white/10 transition-colors"
                        >
                            {t('faq.talk_expert')}
                        </a>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
