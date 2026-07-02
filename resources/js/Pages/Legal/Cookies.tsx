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

export default function Cookies() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    const COOKIE_TYPES = [
        { nameKey: 'cookies.type1_name', purposeKey: 'cookies.type1_purpose', examplesKey: 'cookies.type1_examples', canDisable: false },
        { nameKey: 'cookies.type2_name', purposeKey: 'cookies.type2_purpose', examplesKey: 'cookies.type2_examples', canDisable: true },
        { nameKey: 'cookies.type3_name', purposeKey: 'cookies.type3_purpose', examplesKey: 'cookies.type3_examples', canDisable: true },
        { nameKey: 'cookies.type4_name', purposeKey: 'cookies.type4_purpose', examplesKey: 'cookies.type4_examples', canDisable: true },
    ];

    return (
        <AppLayout>
            <Head title="Cookie Policy  Gokusafiri" />

            <section className="bg-[#16241b] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">{t('cookies.eyebrow')}</p>
                    <h1 className="font-display not-italic text-[38px] leading-[46px] md:text-[56px] md:leading-[62px] tracking-[-0.62px] text-white mb-3">
                        {t('cookies.title')}
                    </h1>
                    <p className="text-[14px] text-white/50">{t('cookies.last_updated')}</p>
                </div>
            </section>

            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[820px]">

                        <Section title={t('cookies.s1_title')}>
                            <p>{t('cookies.s1_p1')}</p>
                            <p>{t('cookies.s1_p2')}</p>
                        </Section>

                        <Section title={t('cookies.s2_title')}>
                            <p>{t('cookies.s2_intro')}</p>
                            <div className="mt-4 space-y-4">
                                {COOKIE_TYPES.map(({ nameKey, purposeKey, examplesKey, canDisable }) => (
                                    <div key={nameKey} className="rounded-[14px] border border-[#e4ddd0] p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-[15px] text-[#16241b]">{t(nameKey)}</h3>
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${canDisable ? 'bg-[#fbf8f2] text-[#8a968d]' : 'bg-[#eef3ec] text-[#6e8c79]'}`}>
                                                {canDisable ? t('cookies.optional') : t('cookies.required')}
                                            </span>
                                        </div>
                                        <p className="text-[14px] leading-[22px] text-[#4f5c53] mb-2">{t(purposeKey)}</p>
                                        <p className="text-[12px] text-[#8a968d]">{t('cookies.examples_label')} {t(examplesKey)}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title={t('cookies.s3_title')}>
                            <p>{t('cookies.s3_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s3_i1','s3_i2','s3_i3'] as const).map(k => (
                                    <li key={k}><strong>{t(`cookies.${k}_label`)}</strong> {t(`cookies.${k}_desc`)}</li>
                                ))}
                            </ul>
                            <p>{t('cookies.s3_outro')}</p>
                        </Section>

                        <Section title={t('cookies.s4_title')}>
                            <p>{t('cookies.s4_intro')}</p>
                            <ul className="list-disc pl-5 space-y-2">
                                {(['s4_i1','s4_i2','s4_i3','s4_i4'] as const).map(k => (
                                    <li key={k}>{t(`cookies.${k}`)}</li>
                                ))}
                            </ul>
                            <p>{t('cookies.s4_p2')}</p>
                            <p>
                                {t('cookies.s4_p3')}{' '}
                                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#6e8c79] hover:underline">
                                    {t('cookies.s4_ga_link')}
                                </a>.
                            </p>
                        </Section>

                        <Section title={t('cookies.s5_title')}>
                            <p>{t('cookies.s5_p1')}</p>
                            <p>{t('cookies.s5_p2')}</p>
                        </Section>

                        <Section title={t('cookies.s6_title')}>
                            <p>{t('cookies.s6_body')}</p>
                        </Section>

                        <div className="pt-4 border-t border-[#e4ddd0]">
                            <p className="text-[14px] text-[#8a968d]">
                                {t('cookies.see_also')}{' '}
                                <Link href={`${p}/privacy`} className="text-[#6e8c79] hover:underline">{t('cookies.see_also_privacy')}</Link>
                                {' · '}
                                <Link href={`${p}/terms`} className="text-[#6e8c79] hover:underline">{t('cookies.see_also_terms')}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
