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

export default function Privacy() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Privacy Policy  Gokusafiri" />

            <section className="bg-[#16241b] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">{t('privacy.eyebrow')}</p>
                    <h1 className="font-display not-italic text-[38px] leading-[46px] md:text-[56px] md:leading-[62px] tracking-[-0.62px] text-white mb-3">
                        {t('privacy.title')}
                    </h1>
                    <p className="text-[14px] text-white/50">{t('privacy.last_updated')}</p>
                </div>
            </section>

            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[820px]">

                        <Section title={t('privacy.s1_title')}>
                            <p>{t('privacy.s1_p1')}</p>
                            <p>{t('privacy.s1_p2')}</p>
                        </Section>

                        <Section title={t('privacy.s2_title')}>
                            <p>{t('privacy.s2_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s2_i1','s2_i2','s2_i3','s2_i4','s2_i5','s2_i6'] as const).map(k => (
                                    <li key={k}><strong>{t(`privacy.${k}_label`)}</strong> {t(`privacy.${k}_desc`)}</li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={t('privacy.s3_title')}>
                            <p>{t('privacy.s3_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s3_i1','s3_i2','s3_i3','s3_i4','s3_i5','s3_i6','s3_i7'] as const).map(k => (
                                    <li key={k}>{t(`privacy.${k}`)}</li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={t('privacy.s4_title')}>
                            <p>{t('privacy.s4_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s4_i1','s4_i2','s4_i3','s4_i4'] as const).map(k => (
                                    <li key={k}><strong>{t(`privacy.${k}_label`)}</strong> {t(`privacy.${k}_desc`)}</li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={t('privacy.s5_title')}>
                            <p>{t('privacy.s5_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s5_i1','s5_i2','s5_i3','s5_i4','s5_i5'] as const).map(k => (
                                    <li key={k}><strong>{t(`privacy.${k}_label`)}</strong> {t(`privacy.${k}_desc`)}</li>
                                ))}
                            </ul>
                            <p>{t('privacy.s5_outro')}</p>
                        </Section>

                        <Section title={t('privacy.s6_title')}>
                            <p>{t('privacy.s6_body')}</p>
                        </Section>

                        <Section title={t('privacy.s7_title')}>
                            <p>{t('privacy.s7_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s7_i1','s7_i2','s7_i3','s7_i4','s7_i5','s7_i6','s7_i7'] as const).map(k => (
                                    <li key={k}><strong>{t(`privacy.${k}_label`)}</strong> {t(`privacy.${k}_desc`)}</li>
                                ))}
                            </ul>
                            <p>
                                {t('privacy.s7_contact')}
                            </p>
                        </Section>

                        <Section title={t('privacy.s8_title')}>
                            <p>
                                {t('privacy.s8_body')}{' '}
                                <Link href={`${p}/cookies`} className="text-[#6e8c79] hover:underline">{t('privacy.s8_link')}</Link>.
                            </p>
                        </Section>

                        <Section title={t('privacy.s9_title')}>
                            <p>{t('privacy.s9_body')}</p>
                        </Section>

                        <Section title={t('privacy.s10_title')}>
                            <p>{t('privacy.s10_body')}</p>
                        </Section>

                        <Section title={t('privacy.s11_title')}>
                            <p>{t('privacy.s11_intro')}</p>
                            <address className="not-italic mt-2 text-[15px] text-[#4f5c53]">
                                Gokusafiri Ltd<br />
                                Karen Road, Karen, Nairobi, Kenya<br />
                                <a href="mailto:support@gokusafiri.com" className="text-[#6e8c79] hover:underline">support@gokusafiri.com</a>
                            </address>
                        </Section>

                        <div className="pt-4 border-t border-[#e4ddd0]">
                            <p className="text-[14px] text-[#8a968d]">
                                {t('privacy.see_also')}{' '}
                                <Link href={`${p}/terms`} className="text-[#6e8c79] hover:underline">{t('privacy.see_also_terms')}</Link>
                                {' · '}
                                <Link href={`${p}/cookies`} className="text-[#6e8c79] hover:underline">{t('privacy.see_also_cookies')}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
