import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { Award, Star } from 'lucide-react';
import type { PageProps } from '../../types';

const GUIDES = [
    {
        name: 'Vincent',
        country: 'Kenya',
        specialty: 'Wildlife & Big Five',
        years: 12,
        bio: 'Vincent grew up near the Maasai Mara and has tracked the Great Migration every year since he was a teenager. He holds a Kenya Professional Safari Guide Level 3 certification.',
        img: '/images/guides/1.jpeg',
        tags: ['Big Five', 'Migration', 'Night drives'],
    },
    {
        name: 'Venant',
        country: 'Rwanda',
        specialty: 'Birding & Ecology',
        years: 8,
        bio: "With over 900 bird species identified in the field, Venant is one of East Africa's most sought-after birding guides. She is also a trained botanist and ecology interpreter.",
        img: '/images/guides/5.jpeg',
        tags: ['Birding', 'Ecology', 'Serengeti'],
    },
];

const CREDENTIALS = [
    { label: 'FGASA & KPSGA certified', body: 'All our guides hold government-issued professional guide certifications for their country of operation.' },
    { label: 'First-aid trained', body: 'Every guide completes a Wilderness First Aid course and carries emergency equipment on all outings.' },
    { label: 'Annual refresher courses', body: 'We invest in ongoing training  each guide completes at least 40 hours of continued education per year.' },
    { label: 'Vetted & reviewed', body: 'Every guide is personally interviewed, field-assessed, and reviewed by guests after every journey.' },
];

export default function Guides() {
    const { locale } = usePage<PageProps>().props;
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Our Guides  Gokusafiri" />

            {/* Hero */}
            <section className="relative bg-[#16241b] py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/hero-safari.jpg" alt="" className="w-full h-full object-cover opacity-15" />
                </div>
                <div className="relative max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        Your people on the ground
                    </p>
                    <h1 className="font-display not-italic text-[42px] leading-[50px] md:text-[64px] md:leading-[70px] tracking-[-0.62px] text-white max-w-[620px] mb-6">
                        Meet your guides
                    </h1>
                    <p className="text-[16px] leading-[26px] text-white/70 max-w-[500px]">
                        Every Gokusafiri journey is led by a certified local guide who has spent years  sometimes decades  living and working in the wild places they show you.
                    </p>
                </div>
            </section>

            {/* Guides grid */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GUIDES.map((guide) => (
                            <div key={guide.name} className="bg-white rounded-[22px] p-7 flex flex-col">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-16 h-16 rounded-full bg-[#eef3ec] overflow-hidden shrink-0">
                                        {guide.img
                                            ? <img src={guide.img} alt={guide.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center font-bold text-[22px] text-[#6e8c79]">{guide.name[0]}</div>
                                        }
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[16px] text-[#16241b]">{guide.name}</h3>
                                        <p className="text-[13px] text-[#6e8c79] font-medium">{guide.specialty}</p>
                                        <p className="text-[12px] text-[#8a968d]">{guide.country} · {guide.years} years</p>
                                    </div>
                                </div>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53] flex-1 mb-4">{guide.bio}</p>
                                <div className="flex flex-wrap gap-2">
                                    {guide.tags.map((tag) => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-[#eef3ec] text-[#6e8c79] text-[12px] font-medium">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Credentials */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                                Our standards
                            </p>
                            <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b] mb-4">
                                Certified, trained, and trusted
                            </h2>
                            <p className="text-[15px] leading-[24px] text-[#4f5c53]">
                                Every guide in our network meets rigorous safety and knowledge standards before they ever lead a Gokusafiri journey. We believe your guide makes the difference between a good safari and an unforgettable one.
                            </p>
                        </div>
                        <div className="space-y-5">
                            {CREDENTIALS.map(({ label, body }) => (
                                <div key={label} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#eef3ec] flex items-center justify-center shrink-0 mt-0.5">
                                        <Award size={16} className="text-[#6e8c79]" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[15px] text-[#16241b] mb-1">{label}</h4>
                                        <p className="text-[14px] leading-[22px] text-[#4f5c53]">{body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#fbf8f2] py-16">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <div className="flex items-center justify-center gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-[#f0a05e] text-[#f0a05e]" />)}
                    </div>
                    <h2 className="font-display not-italic text-[28px] md:text-[38px] tracking-[-0.62px] text-[#16241b] mb-3">
                        Your guide is waiting
                    </h2>
                    <p className="text-[15px] text-[#4f5c53] mb-8 max-w-[400px] mx-auto">
                        Every Gokusafiri tour is matched with the right guide for your destination and travel style.
                    </p>
                    <Link
                        href={`${p}/tours`}
                        className="inline-flex px-[28px] py-[14px] rounded-full bg-[#6e8c79] text-white text-[15px] font-medium hover:bg-[#5a7865] transition-colors"
                    >
                        Browse safaris
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}
