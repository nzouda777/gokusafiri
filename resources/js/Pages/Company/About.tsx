import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { Compass, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

const TEAM = [
    { key: 'team1', name: 'Amara Diallo', img: '/images/trust-avatar-1.jpg' },
    { key: 'team2', name: 'James Mwangi', img: '/images/trust-avatar-2.jpg' },
    { key: 'team3', name: 'Lena Osei', img: '/images/trust-avatar-3.jpg' },
    { key: 'team4', name: 'Marc Dupont', img: null },
];

export default function About() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    const VALUES = [
        { icon: Compass, titleKey: 'about.val1_title', bodyKey: 'about.val1_body' },
        { icon: Leaf,    titleKey: 'about.val2_title', bodyKey: 'about.val2_body' },
        { icon: ShieldCheck, titleKey: 'about.val3_title', bodyKey: 'about.val3_body' },
        { icon: Sparkles, titleKey: 'about.val4_title', bodyKey: 'about.val4_body' },
    ];

    const STATS = [
        { value: '120k+', labelKey: 'about.stat1_label' },
        { value: '14',    labelKey: 'about.stat2_label' },
        { value: '4.9',   labelKey: 'about.stat3_label' },
        { value: '2018',  labelKey: 'about.stat4_label' },
    ];

    return (
        <AppLayout>
            <Head title="About Us  Gokusafiri" />

            {/* Hero */}
            <section className="relative bg-[#16241b] py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/hero-safari.jpg" alt="" className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="relative max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        {t('about.eyebrow')}
                    </p>
                    <h1 className="font-display not-italic text-[42px] leading-[50px] md:text-[64px] md:leading-[70px] tracking-[-0.62px] text-white max-w-[680px] mb-6">
                        {t('about.title')}
                    </h1>
                    <p className="text-[16px] leading-[26px] text-white/70 max-w-[520px]">
                        {t('about.subtitle')}
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div>
                            <h2 className="font-display not-italic text-[32px] leading-[40px] md:text-[44px] md:leading-[52px] tracking-[-0.62px] text-[#16241b] mb-6">
                                {t('about.story_title')}
                            </h2>
                            <div className="space-y-4 text-[15px] leading-[24px] text-[#4f5c53]">
                                <p>{t('about.story_p1')}</p>
                                <p>{t('about.story_p2')}</p>
                                <p>{t('about.story_p3')}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="/images/hero-safari.jpg"
                                alt="Safari landscape at dawn"
                                className="rounded-[22px] w-full h-[400px] object-cover"
                            />
                            <div className="absolute -bottom-5 -left-5 bg-white rounded-[16px] shadow-lg px-6 py-4 hidden md:block">
                                <p className="text-[11px] text-[#8a968d] uppercase tracking-wider mb-1">{t('about.founded_label')}</p>
                                <p className="font-display not-italic text-[40px] text-[#16241b] leading-none">2018</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="text-center mb-12">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">
                            {t('about.values_eyebrow')}
                        </p>
                        <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b]">
                            {t('about.values_title')}
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map(({ icon: Icon, titleKey, bodyKey }) => (
                            <div key={titleKey} className="bg-[#fbf8f2] rounded-[22px] p-7">
                                <div className="w-11 h-11 rounded-full bg-[#eef3ec] flex items-center justify-center mb-5 text-[#6e8c79]">
                                    <Icon size={20} />
                                </div>
                                <h3 className="font-semibold text-[16px] text-[#16241b] mb-2">{t(titleKey)}</h3>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53]">{t(bodyKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-[#16241b] py-16">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {STATS.map(({ value, labelKey }) => (
                            <div key={labelKey}>
                                <p className="font-display not-italic text-[48px] leading-[56px] text-[#f0a05e]">{value}</p>
                                <p className="text-[14px] text-white/60 mt-1">{t(labelKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="bg-[#fbf8f2] py-16 md:py-24 hidden">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="text-center mb-12">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">
                            {t('about.team_eyebrow')}
                        </p>
                        <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b]">
                            {t('about.team_title')}
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {TEAM.map((member) => (
                            <div key={member.key} className="text-center">
                                <div className="w-24 h-24 rounded-full bg-[#eef3ec] mx-auto mb-4 overflow-hidden">
                                    {member.img
                                        ? <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-[32px] font-bold text-[#6e8c79]">{member.name[0]}</div>
                                    }
                                </div>
                                <h3 className="font-semibold text-[16px] text-[#16241b] mb-1">{member.name}</h3>
                                <p className="text-[13px] text-[#6e8c79] font-medium mb-3">{t(`about.${member.key}_role`)}</p>
                                <p className="text-[13px] leading-[20px] text-[#4f5c53]">{t(`about.${member.key}_bio`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b] mb-4">
                        {t('about.cta_title')}
                    </h2>
                    <p className="text-[16px] text-[#4f5c53] mb-8 max-w-[480px] mx-auto">
                        {t('about.cta_subtitle')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={`${p}/tours`}
                            className="px-[28px] py-[14px] rounded-full bg-[#6e8c79] text-white text-[15px] font-medium hover:bg-[#5a7865] transition-colors"
                        >
                            {t('about.cta_explore')}
                        </Link>
                        <Link
                            href={`${p}/contact`}
                            className="px-[28px] py-[14px] rounded-full border-2 border-[#e4ddd0] text-[#16241b] text-[15px] font-medium hover:border-[#6e8c79] transition-colors"
                        >
                            {t('about.cta_talk')}
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
