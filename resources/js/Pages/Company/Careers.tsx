import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { MapPin, ArrowRight, Globe, Leaf, Heart, Zap } from 'lucide-react';
import type { PageProps } from '../../types';

const BENEFITS = [
    { icon: Globe, title: 'Work from Africa or anywhere', body: 'Our team is distributed across Nairobi, Cape Town, Paris, and remote-first. We trust you to do great work wherever you are.' },
    { icon: Leaf, title: 'Annual safari allowance', body: 'Every team member receives a complimentary Gokusafiri safari each year. We believe the best way to improve the product is to live it.' },
    { icon: Heart, title: 'Health & wellness', body: 'Comprehensive health insurance, mental health support, and a quarterly wellness budget for every full-time team member.' },
    { icon: Zap, title: 'Growth & learning', body: 'Personal learning budget, regular training in the field, and a direct line to the founders. We grow together.' },
];

const POSITIONS = [
    {
        title: 'Safari Experience Manager',
        location: 'Nairobi, Kenya (Hybrid)',
        type: 'Full-time',
        team: 'Operations',
        description: 'Own the end-to-end experience for our travelers  from the moment they book to the moment they return home. You will coordinate with lodges, guides, and our product team to make every journey seamless.',
        requirements: [
            '3+ years in travel operations or lodge management',
            'Fluent in English; Swahili or French a plus',
            'Based in or willing to relocate to Nairobi',
        ],
    },
    {
        title: 'Digital Marketing Lead',
        location: 'Paris, France or Remote',
        type: 'Full-time',
        team: 'Marketing',
        description: 'Drive growth across our digital channels  paid search, social, SEO, and email. You will own the marketing calendar, manage agency relationships, and report directly to the CEO.',
        requirements: [
            '4+ years in performance or growth marketing',
            'Proven track record in travel, hospitality, or lifestyle brands',
            'Fluent in English; French a plus',
        ],
    },
    {
        title: 'Guest Relations Specialist',
        location: 'Cape Town, South Africa or Remote',
        type: 'Full-time',
        team: 'Guest Experience',
        description: 'Be the voice of Gokusafiri for our travelers  before, during, and after their journey. You will handle bookings, pre-departure briefings, and in-trip support, always with warmth and expertise.',
        requirements: [
            '2+ years in luxury travel, concierge, or guest relations',
            'Calm under pressure, empathetic, detail-oriented',
            'Fluent in English; additional languages a strong plus',
        ],
    },
];

export default function Careers() {
    const { locale: _locale } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Careers  Gokusafiri" />

            {/* Hero */}
            <section className="relative bg-[#16241b] py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/hero-safari.jpg" alt="" className="w-full h-full object-cover opacity-15" />
                </div>
                <div className="relative max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        Join the team
                    </p>
                    <h1 className="font-display not-italic text-[42px] leading-[50px] md:text-[64px] md:leading-[70px] tracking-[-0.62px] text-white max-w-[640px] mb-6">
                        Help shape Africa's story
                    </h1>
                    <p className="text-[16px] leading-[26px] text-white/70 max-w-[500px]">
                        We're a small, deeply passionate team building the world's best platform for African travel. If you care about wild places, people, and great products  we'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Culture */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">Our culture</p>
                            <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b] mb-5">
                                Small team, big impact
                            </h2>
                            <p className="text-[15px] leading-[24px] text-[#4f5c53] mb-4">
                                Gokusafiri has always been a lean team of highly motivated people. We don't believe in bureaucracy or hierarchy for its own sake. We believe in doing meaningful work with talented people who care.
                            </p>
                            <p className="text-[15px] leading-[24px] text-[#4f5c53]">
                                Our team is spread across three continents and connected by a shared love of Africa, a commitment to responsible travel, and a healthy obsession with making our travelers' experiences extraordinary.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {BENEFITS.map(({ icon: Icon, title, body }) => (
                                <div key={title} className="bg-white rounded-[18px] p-6">
                                    <Icon size={20} className="text-[#6e8c79] mb-3" />
                                    <h4 className="font-semibold text-[14px] text-[#16241b] mb-1.5">{title}</h4>
                                    <p className="text-[13px] leading-[20px] text-[#4f5c53]">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Open positions */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="mb-12">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">Now hiring</p>
                        <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b]">
                            Open positions
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {POSITIONS.map((pos) => (
                            <div key={pos.title} className="border border-[#e4ddd0] rounded-[22px] p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                                    <div>
                                        <h3 className="font-semibold text-[20px] text-[#16241b] mb-1.5">{pos.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="flex items-center gap-1 text-[13px] text-[#4f5c53]">
                                                <MapPin size={13} className="text-[#6e8c79]" />{pos.location}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-[#eef3ec] text-[#6e8c79] text-[12px] font-medium">{pos.type}</span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-[#fbf8f2] text-[#4f5c53] text-[12px]">{pos.team}</span>
                                        </div>
                                    </div>
                                    <a
                                        href="mailto:support@gokusafiri.com"
                                        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6e8c79] text-white text-[14px] font-medium hover:bg-[#5a7865] transition-colors"
                                    >
                                        Apply <ArrowRight size={14} />
                                    </a>
                                </div>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53] mb-4">{pos.description}</p>
                                <ul className="space-y-1.5">
                                    {pos.requirements.map((req) => (
                                        <li key={req} className="flex items-start gap-2 text-[14px] text-[#4f5c53]">
                                            <span className="text-[#6e8c79] mt-0.5">·</span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* General application */}
            <section className="bg-[#fbf8f2] py-14">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <h2 className="font-display not-italic text-[28px] md:text-[36px] tracking-[-0.62px] text-[#16241b] mb-3">
                        Don't see your role?
                    </h2>
                    <p className="text-[15px] text-[#4f5c53] mb-6 max-w-[400px] mx-auto">
                        We're always interested in exceptional people. Send us a note and tell us what you'd bring to Gokusafiri.
                    </p>
                    <a
                        href="mailto:support@gokusafiri.com"
                        className="inline-flex items-center gap-2 px-[28px] py-[14px] rounded-full border-2 border-[#6e8c79] text-[#16241b] text-[15px] font-medium hover:bg-[#eef3ec] transition-colors"
                    >
                        support@gokusafiri.com <ArrowRight size={16} />
                    </a>
                </div>
            </section>
        </AppLayout>
    );
}
