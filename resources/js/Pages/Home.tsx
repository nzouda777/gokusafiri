import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Components/AppLayout';
import SearchBar from '../Components/SearchBar';
import TourCard from '../Components/TourCard';
import { Star, ChevronDown, ChevronUp, Compass, ShieldCheck, Leaf, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { Tour } from '../types';

interface DestinationItem {
    name: string;
    image: string;
    slug: string;
    count: number;
    country: string;
}

interface Props {
    featured: Tour[];
    destinations: DestinationItem[];
    testimonials: { name: string; location: string; year: number; text: string; avatar?: string }[];
    faqs: { q: string; a: string }[];
    stats: { travelers: string; countries: number; rating: number };
}

const STYLES = ['All', 'Safari', 'Beaches', 'Mountains', 'Culture', 'Gorilla trekking', 'Honeymoon'];

const BENTO_SLOTS: { col: string; row: string }[] = [
    { col: 'col-start-1',            row: 'row-start-1 row-span-2' },
    { col: 'col-start-2',            row: 'row-start-1' },
    { col: 'col-start-3 col-span-2', row: 'row-start-1' },
    { col: 'col-start-2 col-span-2', row: 'row-start-2' },
    { col: 'col-start-4',            row: 'row-start-2' },
];

export default function Home({ featured, destinations, testimonials, faqs, stats }: Props) {
    const { t } = useLaravelReactI18n();
    const [activeStyle, setActiveStyle] = useState('All');

    return (
        <AppLayout>
            <Head title="Hand-crafted safaris & coastal escapes" />

            {/* ── HERO ──────────────────────────────────────────────────── */}
            {/* overflow-hidden is on the image wrapper, NOT the section  keeps search bar dropdowns visible */}
            <section className="relative min-h-[560px] flex items-center">
                {/* Background: gradient + hero image */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ background: 'linear-gradient(133deg,#3a5a45 12%,#1e3326 61%,#d9722a 100%)' }}
                >
                    <img
                        src="/images/hero-safari.jpg"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)]"
                    />
                </div>
                {/* Left-to-right overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#16241b] to-[rgba(19,34,25,0.50)] " />

                {/* Content */}
                <div className="relative z-10 w-full max-w-[1440px] mx-auto px-[100px] max-lg:px-6 pb-[88px]">
                    <div className="flex flex-col gap-[14px] sm:gap-[18px] max-w-[660px] pt-[50px] pb-[50px] sm:pt-[74px] sm:pb-[70px]">

                        <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase">
                            {t('hero.eyebrow')}
                        </p>

                        <div className="flex flex-col">
                            <span className="font-display not-italic text-[38px] leading-[46px] sm:text-[52px] sm:leading-[58px] lg:text-[62px] lg:leading-[65px] tracking-[-0.62px] text-white">
                                {t('hero.line1')}
                            </span>
                            <span className="font-display italic text-[38px] leading-[46px] sm:text-[52px] sm:leading-[58px] lg:text-[62px] lg:leading-[65px] tracking-[-0.62px] text-[#f0a05e]">
                                {t('hero.line2')}
                            </span>
                        </div>

                        <p className="text-[15px] leading-[23px] sm:text-[18px] sm:leading-[27px] text-white/85 max-w-[480px]">
                            {t('hero.subtitle')}
                        </p>

                        <div className="flex flex-wrap items-center gap-[12px] pt-[12px]">
                            <Link
                                href="/tours"
                                className="px-[24px] py-[13px] sm:px-[34px] sm:py-[17px] rounded-full bg-[#6e8c79] text-white text-[15px] sm:text-[16px] font-medium leading-[24px] hover:bg-[#5a7865] transition-colors"
                            >
                                {t('hero.cta_explore')}
                            </Link>
                            <a
                                href="#how-it-works"
                                className="px-[20px] py-[11px] sm:px-[27px] sm:py-[15px] rounded-full border border-[#e4ddd0] text-[#dce6dd] text-[15px] sm:text-[16px] font-medium leading-[24px] hover:bg-white/10 transition-colors"
                            >
                                {t('hero.cta_how')}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Docked search  floats at bottom of hero, half-overlapping */}
                <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 w-full max-w-[1240px] px-6 lg:px-0 z-20 hidden md:block">
                    <SearchBar />
                </div>
            </section>

            {/* Spacer for search bar overlap on desktop */}
            <div className="hidden md:block h-[44px]" />

            {/* ── TRUST BAR ─────────────────────────────────────────────── */}
            <section className="bg-[#fbf8f2] border-b border-[#e4ddd0]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 py-[30px]">
                    <div className="flex flex-wrap items-center justify-center gap-x-[36px] gap-y-3">

                        {/* Avatars + travelers */}
                        <div className="flex items-center gap-[10px]">
                            <div className="flex items-center">
                                {['/images/trust-avatar-1.jpg', '/images/trust-avatar-2.jpg', '/images/trust-avatar-3.jpg'].map((src, i) => (
                                    <div
                                        key={i}
                                        className="size-[34px] rounded-full border-2 border-[#fbf8f2] overflow-hidden bg-[#eef3ec]"
                                        style={{ marginLeft: i > 0 ? '-10px' : '0' }}
                                    >
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-[14px] leading-[21px]">
                                <span className="font-semibold text-[#1a211c]">25 {t('trust.travelers')}</span>
                                <span className="text-[#4f5c53]"> {t('trust.booked_today')}</span>
                            </div>
                        </div>

                        {/* Stars + rating */}
                        <div className="flex items-center gap-[10px]">
                            <div className="flex items-center gap-[5px]">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={14} className="fill-[#f0a05e] text-[#f0a05e]" />
                                ))}
                            </div>
                            <span className="text-[14px] font-semibold text-[#4f5c53] leading-[21px]">
                                4.9 · 12k+ reviews
                            </span>
                        </div>

                        {/* Checkmarks */}
                        <div className="flex items-center gap-[5px]">
                            <Check size={14} className="text-[#6e8c79]" />
                            <span className="text-[14px] font-semibold text-[#4f5c53] leading-[21px]">{t('trust.free_cancel')}</span>
                        </div>
                        <div className="flex items-center gap-[5px]">
                            <Check size={14} className="text-[#6e8c79]" />
                            <span className="text-[14px] font-semibold text-[#4f5c53] leading-[21px]">{t('trust.local_experts')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile search */}
            <div className="md:hidden bg-[#fbf8f2] px-6 pb-6">
                <SearchBar />
            </div>

            {/* ── POPULAR PACKAGES ──────────────────────────────────────── */}
            <section className="bg-[#fbf8f2] py-[60px] md:py-[100px]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">

                    {/* Section header */}
                    <div className="flex items-end justify-between mb-[32px] md:mb-[44px]">
                        <div className="flex flex-col items-start">
                            <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase mb-[0px]">
                                {t('packages.eyebrow')}
                            </p>
                            <h2 className="font-display not-italic text-[30px] leading-[38px] md:text-[48px] md:leading-[65px] tracking-[-0.62px] text-[#16241b]">
                                {t('packages.title')}
                            </h2>
                        </div>
                        <Link
                            href="/packages"
                            className="hidden sm:flex items-center gap-[10px] px-[29px] py-[17px] rounded-full border-[3px] border-[rgba(138,150,141,0.13)] bg-gradient-to-b from-white to-[#fdfdfd] text-[16px] font-medium text-[#1e3326] hover:border-[#6e8c79] transition-colors"
                        >
                            {t('packages.view_all')}
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                        {featured.map((tour) => (
                            <TourCard key={tour.id} tour={tour} />
                        ))}
                    </div>

                    <div className="mt-6 text-center sm:hidden">
                        <Link href="/packages" className="text-[14px] font-medium text-[#6e8c79] hover:underline">
                            {t('packages.view_all')} →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FIND YOUR KIND OF AFRICA ─────────────────────────────── */}
            <section className="py-[60px] md:py-[100px] bg-[#2E4A39]">
                <div className="max-w-[1240px] mx-auto px-6 lg:px-0">

                    {/* Header */}
                    <div className="flex items-end mb-[24px] md:mb-[30px]">
                        <div className="flex flex-col gap-[11.5px] pt-[4px]">
                            <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase">
                                {t('explore.eyebrow')}
                            </p>
                            <h2 className="font-display not-italic text-[#dce6dd] text-[30px] leading-[38px] md:text-[48px] md:leading-[65px] tracking-[-0.62px]">
                                {t('explore.title')}
                            </h2>
                        </div>
                    </div>

                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-3 mb-[30px]">
                        {STYLES.map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveStyle(s)}
                                className={`px-[19px] py-[10px] rounded-full text-[14px] font-semibold leading-[21px] border transition-colors ${
                                    activeStyle === s
                                        ? 'bg-[#eef3ec] border-[#2E4A39] text-[#2E4A39]'
                                        : 'bg-transparent border-[#eef3ec] text-[#eef3ec] hover:bg-white/10'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Desktop bento (lg+) */}
                    {destinations.length > 0 && (
                        <>
                            <div className="hidden lg:grid grid-cols-4 grid-rows-[200px_200px] gap-[18px] h-[418px] w-full">
                                {BENTO_SLOTS.map(({ col, row }, i) => {
                                    const dest = destinations[i];
                                    if (!dest) return null;
                                    return (
                                        <a
                                            key={dest.slug}
                                            href={`/tours?destination=${dest.slug}`}
                                            className={`${col} ${row} relative rounded-[14px] overflow-hidden group`}
                                        >
                                            <img
                                                src={dest.image || '/images/placeholder-safari.jpg'}
                                                alt={dest.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,36,27,0.72)_0%,rgba(22,36,27,0)_60%)]" />
                                            <div className="absolute bottom-[15px] left-[18px] right-[18px] flex flex-col gap-[2px]">
                                                <p className="font-display not-italic text-white text-[21px] leading-[31.5px]">{dest.name}</p>
                                                <p className="font-hanken font-semibold text-white text-[13px] leading-[19.5px] opacity-85">
                                                    {dest.country} · {t('explore.count_tours', { count: dest.count })}
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>

                            {/* Mobile / tablet */}
                            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {destinations.map((dest) => (
                                    <a
                                        key={dest.slug}
                                        href={`/tours?destination=${dest.slug}`}
                                        className="relative rounded-[14px] overflow-hidden group aspect-[4/3]"
                                    >
                                        <img
                                            src={dest.image || '/images/placeholder-safari.jpg'}
                                            alt={dest.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(22,36,27,0.72)_0%,rgba(22,36,27,0)_60%)]" />
                                        <div className="absolute bottom-[15px] left-[18px] right-[18px] flex flex-col gap-[2px]">
                                            <p className="font-display not-italic text-white text-[21px] leading-[31.5px]">{dest.name}</p>
                                            <p className="font-hanken font-semibold text-white text-[13px] leading-[19.5px] opacity-85">
                                                {dest.country} · {t('explore.count_tours', { count: dest.count })}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ── WHY GOKUSAFIRI ───────────────────────────────────────── */}
            <section id="how-it-works" className="py-[100px] bg-[#fbf8f2]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 flex flex-col gap-[44px]">

                    {/* Header  left-aligned */}
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col items-start max-w-[490px]">
                            <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase">
                                {t('why.eyebrow')}
                            </p>
                            <h2 className="font-display not-italic text-[30px] leading-[38px] md:text-[48px] md:leading-[65px] tracking-[-0.62px] text-[#16241b]">
                                {t('why.title')}
                            </h2>
                        </div>
                    </div>

                    {/* 4 feature columns  open layout, no white cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
                        {[
                            { icon: <Compass size={28} className="text-[#6e8c79]" />,     title: t('why.f1_title'), desc: t('why.f1_body') },
                            { icon: <ShieldCheck size={28} className="text-[#6e8c79]" />, title: t('why.f2_title'), desc: t('why.f2_body') },
                            { icon: <Sparkles size={28} className="text-[#6e8c79]" />,    title: t('why.f4_title'), desc: t('why.f4_body') },
                            { icon: <Leaf size={28} className="text-[#6e8c79]" />,        title: t('why.f3_title'), desc: t('why.f3_body') },
                        ].map((f) => (
                            <div key={f.title} className="flex flex-col gap-[11px] items-start">
                                <div className="w-[54px] h-[54px] rounded-[14px] bg-[#eef3ec] flex items-center justify-center shrink-0">
                                    {f.icon}
                                </div>
                                <h3 className="font-display not-italic text-[21px] leading-[22px] tracking-[-0.21px] text-[#1a211c]">
                                    {f.title}
                                </h3>
                                <p className="text-[14.5px] text-[#4f5c53] leading-[21.75px]">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Stats  #eef3ec rounded card */}
                    <div className="bg-[#eef3ec] rounded-[22px] p-[30px] md:p-[54px] grid md:grid-cols-3 grid-cols-1 gap-[30px]">
                        <div className="flex flex-col items-center gap-[1.5px]">
                            <p className="font-display not-italic text-[40px] md:text-[64px] leading-[1.125] text-center">
                                {(() => {
                                    const m = stats.travelers.match(/^(\d+)(k)(.*)$/i);
                                    return m
                                        ? <><span className="text-[#2e4a39]">{m[1]}</span><span className="text-[#e8853b]">k</span><span className="text-[#2e4a39]">{m[3]}</span></>
                                        : <span className="text-[#2e4a39]">{stats.travelers}</span>;
                                })()}
                            </p>
                            <p className="font-medium text-[14px] leading-[21px] text-[#2e4a39] text-center">{t('why.stat_travelers')}</p>
                        </div>
                        <div className="flex flex-col items-center gap-[1.5px]">
                            <p className="font-display not-italic text-[40px] md:text-[64px] leading-[1.125] text-[#2e4a39] text-center">{stats.countries}</p>
                            <p className="font-medium text-[14px] leading-[21px] text-[#2e4a39] text-center">{t('why.stat_countries')}</p>
                        </div>
                        <div className="flex flex-col items-center gap-[1.5px]">
                            <div className="flex items-center gap-[5px]">
                                <p className="font-display not-italic text-[40px] md:text-[64px] leading-[1.125] text-[#2e4a39] text-center">{stats.rating}</p>
                                <Star size={28} className="fill-[#e8853b] text-[#e8853b] md:hidden" />
                                <Star size={37} className="fill-[#e8853b] text-[#e8853b] hidden md:block" />
                            </div>
                            <p className="font-medium text-[14px] leading-[21px] text-[#2e4a39] text-center">{t('why.stat_rating')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
            <section className="py-[60px] md:py-[100px] bg-[#2E4A39]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="flex flex-col lg:flex-row gap-[48px] md:gap-[80px] xl:gap-[110px] items-start">

                        {/* Left: heading block */}
                        <div className="w-full lg:w-[290px] xl:w-[320px] shrink-0 pt-[6px]">
                            <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase mb-[16px]">
                                {t('testimonials.eyebrow')}
                            </p>
                            <h2 className="font-display italic text-[36px] sm:text-[52px] xl:text-[56px] leading-[1.1] tracking-[-0.56px] text-white mb-[24px] md:mb-[32px]">
                                {t('testimonials.title')}
                            </h2>

                            {/* Overlapping avatars + review count */}
                            <div className="flex items-center gap-[12px] mb-[16px]">
                                <div className="flex items-center">
                                    {['#7a9b8a', '#c97b4b', '#4e7a61'].map((bg, i) => (
                                        <div
                                            key={i}
                                            className="size-[34px] rounded-full border-2 border-[#2E4A39] flex items-center justify-center text-[11px] font-bold text-white"
                                            style={{ background: bg, marginLeft: i > 0 ? '-8px' : '0' }}
                                        >
                                            {['A', 'J', 'L'][i]}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[13px] text-white/60 leading-snug">
                                    {t('testimonials.reviews')}
                                </span>
                            </div>

                            {/* Stars + rating */}
                            <div className="flex items-center gap-[8px]">
                                <div className="flex gap-[3px]">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} size={14} className="fill-[#f0a05e] text-[#f0a05e]" />
                                    ))}
                                </div>
                                <span className="text-[13px] text-white/60">{t('testimonials.avg_rating')}</span>
                            </div>
                        </div>

                        {/* Right: 3 white testimonial cards */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                            {testimonials.map((t, i) => {
                                const initials = t.name[0].toUpperCase();
                                const avatarBg = ['#7a9b8a', '#c97b4b', '#4e7a61'][i % 3];
                                return (
                                    <div
                                        key={i}
                                        className="bg-white rounded-[20px] p-[28px] shadow-[0px_4px_20px_rgba(0,0,0,0.10)] flex flex-col gap-[20px]"
                                    >
                                        {/* Stars */}
                                        <div className="flex gap-[3px]">
                                            {[1,2,3,4,5].map(j => (
                                                <Star key={j} size={13} className="fill-[#f0a05e] text-[#f0a05e]" />
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <p className="font-display italic text-[15px] leading-[23px] text-[#1a211c] flex-1">
                                            &ldquo;{t.text}&rdquo;
                                        </p>

                                        {/* Author */}
                                        <div className="flex items-center gap-[12px]">
                                            <div
                                                className="size-[46px] rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-semibold text-[16px]"
                                                style={{ background: t.avatar ? 'transparent' : avatarBg }}
                                            >
                                                {t.avatar
                                                    ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                                                    : initials
                                                }
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-semibold text-[#1a211c] leading-[20px]">
                                                    {t.name}
                                                </p>
                                                <p className="text-[12px] text-[#8a968d] leading-[18px]">
                                                    {t.location}, {t.year}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────── */}
            <section className="py-[60px] md:py-[100px] bg-[#fbf8f2]">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="flex flex-col lg:flex-row gap-[40px] md:gap-[80px] xl:gap-[110px] items-start">

                        {/* Left: sticky heading */}
                        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 lg:pt-[6px]">
                            <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase mb-[14px]">
                                {t('faq.eyebrow')}
                            </p>
                            <h2 className="font-display not-italic text-[28px] leading-[36px] md:text-[44px] md:leading-[1.2] tracking-[-0.44px] text-[#16241b] mb-[16px] md:mb-[20px]">
                                {t('faq.title')}
                            </h2>
                            <p className="text-[15px] leading-[23px] text-[#8a968d] mb-[28px]">
                                {t('faq.help')}
                            </p>
                            <a
                                href="mailto:hello@gokusafiri.com"
                                className="inline-flex items-center gap-[8px] px-[24px] py-[13px] rounded-full border-[1.5px] border-[#c5d3c8] text-[#2E4A39] text-[14px] font-medium hover:border-[#6e8c79] hover:bg-white transition-colors"
                            >
                                {t('faq.talk_expert')}
                                <ArrowRight size={15} />
                            </a>
                        </div>

                        {/* Right: accordion */}
                        <div className="flex-1 space-y-[10px]">
                            {faqs.map((faq, i) => (
                                <FaqItem key={i} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className='!bg-[#fbf8f2] w-full py-[32px] px-8'>
            <section className="relative py-[80px] overflow-hidden  max-w-[1240px] mx-auto  rounded-[22px] md:px-[70px] px-[30px] ">
                {/* Gradient background  matches hero palette */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(133deg,#3a5a45 2%,#1e3326 55%,#c97b4b 100%)' }}
                />
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 bg-[url('/images/hero-safari.jpg')] bg-cover bg-center opacity-[0.12]" />

                <div className="relative z-10 max-w-[640px] mx-auto md:mx-0 px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] leading-[18px] tracking-[2.16px] uppercase mb-[14px] md:text-left text-center">
                        {t('cta.eyebrow')}
                    </p>
                    <h2 className="font-display not-italic text-[32px] leading-[1.2] md:text-[52px] md:leading-[1.15] tracking-[-0.52px] text-white mb-[16px] md:mb-[20px] md:text-left text-center">
                        {t('cta.title')}
                    </h2>
                    <p className="text-[16px] leading-[27px] text-white/75 mb-[40px] max-w-[480px] mx-auto md:mx-0 md:text-left text-center">
                        {t('cta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-[12px] justify-center md:justify-start">
                        <Link
                            href="/tours"
                            className="px-[34px] py-[17px] rounded-full bg-white text-[#16241b] text-[16px] font-semibold hover:bg-[#f0ede8] transition-colors"
                        >
                            {t('cta.book')}
                        </Link>
                        <a
                            href="mailto:hello@gokusafiri.com"
                            className="px-[27px] py-[15px] rounded-full border border-white/30 text-white text-[16px] font-medium hover:bg-white/10 transition-colors"
                        >
                            {t('cta.talk_expert')}
                        </a>
                    </div>
                </div>
            </section>
            </section>
        </AppLayout>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`bg-white rounded-[18px] overflow-hidden border transition-colors ${open ? 'border-[#c5d3c8]' : 'border-[rgba(0,0,0,0.06)]'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-[24px] py-[18px] text-left gap-4"
            >
                <span className="text-[15px] font-medium text-[#16241b] leading-[22px]">{q}</span>
                <div className={`shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors ${open ? 'bg-[#2E4A39]' : 'bg-[#eef3ec]'}`}>
                    {open
                        ? <ChevronUp size={14} className="text-white" />
                        : <ChevronDown size={14} className="text-[#6e8c79]" />
                    }
                </div>
            </button>
            {open && (
                <div className="px-[24px] pb-[18px] text-[14px] text-[#4f5c53] leading-[22px] border-t border-[#e4ddd0]">
                    <div className="pt-[14px]">{a}</div>
                </div>
            )}
        </div>
    );
}
