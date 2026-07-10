import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <h2 className="font-semibold text-[20px] text-[#16241b] mb-4 pb-3 border-b border-[#e4ddd0]">{title}</h2>
            <div className="text-[15px] leading-[26px] text-[#4f5c53] space-y-3">{children}</div>
        </div>
    );
}

export default function Terms() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Terms of Service  Gokusafiri" />

            <section className="bg-[#16241b] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">{t('terms.eyebrow')}</p>
                    <h1 className="font-display not-italic text-[38px] leading-[46px] md:text-[56px] md:leading-[62px] tracking-[-0.62px] text-white mb-3">
                        {t('terms.title')}
                    </h1>
                    <p className="text-[14px] text-white/50">{t('terms.last_updated')}</p>
                </div>
            </section>

            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[820px]">

                        <Section title={t('terms.s1_title')}>
                            <p>{t('terms.s1_p1')}</p>
                            <p>{t('terms.s1_p2')}</p>
                        </Section>

                        <Section title={t('terms.s2_title')}>
                            <p>{t('terms.s2_p1')}</p>
                            <p>{t('terms.s2_p2')}</p>
                            <p>{t('terms.s2_p3')}</p>
                        </Section>

                        <Section title={t('terms.s3_title')}>
                            <p>{t('terms.s3_p1')}</p>
                            <p>{t('terms.s3_p2')}</p>
                            <p>{t('terms.s3_p3')}</p>
                        </Section>

                        <Section title={t('terms.s4_title')}>
                            <p>
                                {t('terms.s4_body')}{' '}
                                (<Link href={`${p}/cancellation-policy`} className="text-[#6e8c79] hover:underline">{t('terms.s4_cancel_link')}</Link>).
                            </p>
                        </Section>

                        <Section title={t('terms.s5_title')}>
                            <p>{t('terms.s5_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s5_i1','s5_i2','s5_i3','s5_i4','s5_i5','s5_i6'] as const).map(k => (
                                    <li key={k}>{t(`terms.${k}`)}</li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={t('terms.s6_title')}>
                            <p>{t('terms.s6_p1')}</p>
                            <p>{t('terms.s6_p2')}</p>
                        </Section>

                        <Section title={t('terms.s7_title')}>
                            <p>{t('terms.s7_p1')}</p>
                            <p>{t('terms.s7_p2')}</p>
                        </Section>

                        <Section title={t('terms.s8_title')}>
                            <p>{t('terms.s8_body')}</p>
                        </Section>

                        <Section title={t('terms.s9_title')}>
                            <p>{t('terms.s9_body')}</p>
                        </Section>

                        <Section title={t('terms.s10_title')}>
                            <p>{t('terms.s10_body')}</p>
                        </Section>

                        <Section title={t('terms.s11_title')}>
                            <p>
                                {t('terms.s11_body')}{' '}
                                <a href="mailto:support@gokusafiri.com" className="text-[#6e8c79] hover:underline">support@gokusafiri.com</a>
                            </p>
                        </Section>

                        <div className="pt-4 border-t border-[#e4ddd0]">
                            <p className="text-[14px] text-[#8a968d]">
                                {t('terms.see_also')}{' '}
                                <Link href={`${p}/privacy`} className="text-[#6e8c79] hover:underline">{t('terms.see_also_privacy')}</Link>
                                {' · '}
                                <Link href={`${p}/cancellation-policy`} className="text-[#6e8c79] hover:underline">{t('terms.see_also_cancel')}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
