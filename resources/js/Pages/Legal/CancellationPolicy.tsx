import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <h2 className="font-semibold text-[20px] text-[#16241b] mb-4 pb-3 border-b border-[#e4ddd0]">{title}</h2>
            <div className="text-[15px] leading-[26px] text-[#4f5c53] space-y-3">{children}</div>
        </div>
    );
}

const TIERS = [
    { refund: '100%', noteKey: 'cancel_policy.tier1_note', windowKey: 'cancel_policy.tier1_window' },
    { refund: '0%',   noteKey: 'cancel_policy.tier2_note', windowKey: 'cancel_policy.tier2_window' },
];

export default function CancellationPolicy() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Cancellation Policy  Gokusafiri" />

            {/* Header */}
            <section className="bg-[#16241b] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">{t('cancel_policy.eyebrow')}</p>
                    <h1 className="font-display not-italic text-[38px] leading-[46px] md:text-[56px] md:leading-[62px] tracking-[-0.62px] text-white mb-3">
                        {t('cancel_policy.title')}
                    </h1>
                    <p className="text-[14px] text-white/50">{t('cancel_policy.last_updated')}</p>
                </div>
            </section>

            {/* Content */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[820px]">

                        <LegalSection title={t('cancel_policy.s1_title')}>
                            <p>{t('cancel_policy.s1_p1')}</p>
                            <p>
                                {t('cancel_policy.s1_p2').split('cancel@gokusafiri.com')[0]}
                                <a href="mailto:cancel@gokusafiri.com" className="text-[#6e8c79] hover:underline">cancel@gokusafiri.com</a>
                                {t('cancel_policy.s1_p2').split('cancel@gokusafiri.com')[1]}
                            </p>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s2_title')}>
                            <p>{t('cancel_policy.s2_intro')}</p>
                            <div className="mt-4 rounded-[16px] overflow-hidden border border-[#e4ddd0]">
                                <table className="w-full text-[14px]">
                                    <thead className="bg-[#fbf8f2]">
                                        <tr>
                                            <th className="text-left px-5 py-3 font-semibold text-[#16241b] border-b border-[#e4ddd0]">{t('cancel_policy.table_window')}</th>
                                            <th className="text-left px-5 py-3 font-semibold text-[#16241b] border-b border-[#e4ddd0]">{t('cancel_policy.table_refund')}</th>
                                            <th className="text-left px-5 py-3 font-semibold text-[#16241b] border-b border-[#e4ddd0] hidden sm:table-cell">{t('cancel_policy.table_note')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {TIERS.map(({ refund, noteKey, windowKey }, i) => (
                                            <tr key={windowKey} className={i < TIERS.length - 1 ? 'border-b border-[#e4ddd0]' : ''}>
                                                <td className="px-5 py-3.5 text-[#4f5c53]">{t(windowKey)}</td>
                                                <td className={`px-5 py-3.5 font-semibold ${refund === '0%' ? 'text-[#e07a3f]' : 'text-[#2e4a39]'}`}>{refund}</td>
                                                <td className="px-5 py-3.5 text-[#8a968d] hidden sm:table-cell">{t(noteKey)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s3_title')}>
                            <p>{t('cancel_policy.s3_intro')}</p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>{t('cancel_policy.s3_step1')}</li>
                                <li>{t('cancel_policy.s3_step2')}</li>
                                <li>{t('cancel_policy.s3_step3')}</li>
                            </ol>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s4_title')}>
                            <p>{t('cancel_policy.s4_p1')}</p>
                            <p>{t('cancel_policy.s4_p2')}</p>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s5_title')}>
                            <p>{t('cancel_policy.s5_p1')}</p>
                            <p>{t('cancel_policy.s5_p2')}</p>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s6_title')}>
                            <p>{t('cancel_policy.s6_body')}</p>
                        </LegalSection>

                        <LegalSection title={t('cancel_policy.s7_title')}>
                            <p>{t('cancel_policy.s7_body')}</p>
                        </LegalSection>

                        <div className="pt-4 border-t border-[#e4ddd0]">
                            <p className="text-[14px] text-[#8a968d]">
                                {t('cancel_policy.see_also')}{' '}
                                <Link href={`${p}/contact`} className="text-[#6e8c79] hover:underline">{t('cancel_policy.contact_link')}</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
