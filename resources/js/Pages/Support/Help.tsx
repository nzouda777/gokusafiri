import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`rounded-[16px] overflow-hidden border transition-colors ${open ? 'border-[#c5d3c8]' : 'border-[#e4ddd0]'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 bg-white"
            >
                <span className="text-[14px] font-medium text-[#16241b] leading-[22px]">{q}</span>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-[#2e4a39]' : 'bg-[#eef3ec]'}`}>
                    {open
                        ? <ChevronUp size={13} className="text-white" />
                        : <ChevronDown size={13} className="text-[#6e8c79]" />
                    }
                </div>
            </button>
            {open && (
                <div className="px-6 pb-4 pt-3 text-[14px] text-[#4f5c53] leading-[22px] bg-white border-t border-[#e4ddd0]">
                    {a}
                </div>
            )}
        </div>
    );
}

export default function Help() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    const CATEGORIES = [
        {
            titleKey: 'help.cat1_title',
            items: [
                { qKey: 'help.cat1_q1', aKey: 'help.cat1_a1' },
                { qKey: 'help.cat1_q2', aKey: 'help.cat1_a2' },
                { qKey: 'help.cat1_q3', aKey: 'help.cat1_a3' },
                { qKey: 'help.cat1_q4', aKey: 'help.cat1_a4' },
            ],
        },
        {
            titleKey: 'help.cat2_title',
            items: [
                { qKey: 'help.cat2_q1', aKey: 'help.cat2_a1' },
                { qKey: 'help.cat2_q2', aKey: 'help.cat2_a2' },
                { qKey: 'help.cat2_q3', aKey: 'help.cat2_a3' },
                { qKey: 'help.cat2_q4', aKey: 'help.cat2_a4' },
            ],
        },
        {
            titleKey: 'help.cat3_title',
            items: [
                { qKey: 'help.cat3_q1', aKey: 'help.cat3_a1' },
                { qKey: 'help.cat3_q2', aKey: 'help.cat3_a2' },
                { qKey: 'help.cat3_q3', aKey: 'help.cat3_a3' },
            ],
        },
        {
            titleKey: 'help.cat4_title',
            items: [
                { qKey: 'help.cat4_q1', aKey: 'help.cat4_a1' },
                { qKey: 'help.cat4_q2', aKey: 'help.cat4_a2' },
                { qKey: 'help.cat4_q3', aKey: 'help.cat4_a3' },
            ],
        },
    ];

    return (
        <AppLayout>
            <Head title="Help Center  Gokusafiri" />

            {/* Hero */}
            <section className="bg-[#fbf8f2] border-b border-[#e4ddd0] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        {t('help.eyebrow')}
                    </p>
                    <h1 className="font-display not-italic text-[40px] leading-[48px] md:text-[58px] md:leading-[64px] tracking-[-0.62px] text-[#16241b] mb-4">
                        {t('help.title')}
                    </h1>
                    <p className="text-[16px] text-[#4f5c53] max-w-[440px] mx-auto">
                        {t('help.subtitle')}
                    </p>
                </div>
            </section>

            {/* FAQ categories */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="space-y-14">
                        {CATEGORIES.map(({ titleKey, items }) => (
                            <div key={titleKey}>
                                <h2 className="font-semibold text-[20px] text-[#16241b] mb-5 pb-3 border-b border-[#e4ddd0]">
                                    {t(titleKey)}
                                </h2>
                                <div className="space-y-3">
                                    {items.map(({ qKey, aKey }) => (
                                        <FaqItem key={qKey} q={t(qKey)} a={t(aKey)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still need help */}
            <section className="bg-[#16241b] py-14">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="text-center mb-10">
                        <h2 className="font-display not-italic text-[28px] md:text-[38px] tracking-[-0.62px] text-white mb-3">
                            {t('help.need_help_title')}
                        </h2>
                        <p className="text-[15px] text-white/60 max-w-[380px] mx-auto">
                            {t('help.need_help_desc')}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:hello@gokusafiri.com"
                            className="flex items-center gap-3 px-6 py-4 rounded-[14px] bg-white/10 hover:bg-white/20 transition-colors text-white"
                        >
                            <Mail size={20} className="text-[#f0a05e]" />
                            <div className="text-left">
                                <p className="text-[13px] text-white/50">{t('help.email_label')}</p>
                                <p className="text-[15px] font-medium">hello@gokusafiri.com</p>
                            </div>
                        </a>
                        <a
                            href="https://wa.me/254700000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-4 rounded-[14px] bg-white/10 hover:bg-white/20 transition-colors text-white"
                        >
                            <MessageCircle size={20} className="text-[#f0a05e]" />
                            <div className="text-left">
                                <p className="text-[13px] text-white/50">{t('help.whatsapp_label')}</p>
                                <p className="text-[15px] font-medium">+254 700 000 000</p>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Full FAQ link */}
            <section className="bg-[#fbf8f2] py-10">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <p className="text-[14px] text-[#4f5c53]">
                        {t('help.more_faq')}{' '}
                        <Link href={`${p}/faq`} className="text-[#6e8c79] font-medium hover:underline">
                            {t('help.view_faq')}
                        </Link>
                    </p>
                </div>
            </section>
        </AppLayout>
    );
}
