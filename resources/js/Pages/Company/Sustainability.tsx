import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { Leaf, Users, TreePine, Globe } from 'lucide-react';
import type { PageProps } from '../../types';

const PILLARS = [
    {
        icon: Leaf,
        title: 'Carbon offset',
        body: 'Every booking automatically includes a verified carbon offset contribution calculated against the flight and ground emissions of your journey. We partner with Gold Standard-certified reforestation projects across East and Central Africa.',
        stat: '15,000+ trees planted',
    },
    {
        icon: Users,
        title: 'Community first',
        body: 'At least 25% of every tour fee goes directly to the local communities around each destination  through employment, craft co-ops, school building programmes, and sustainable agriculture initiatives.',
        stat: '50+ community projects',
    },
    {
        icon: TreePine,
        title: 'Wildlife conservation',
        body: 'We contribute to anti-poaching patrols, wildlife corridor protection, and habitat restoration in collaboration with organizations such as the African Wildlife Foundation and Space for Giants.',
        stat: '$2M+ contributed since 2018',
    },
    {
        icon: Globe,
        title: 'Low-impact lodges',
        body: 'Every lodge and camp in our network is assessed against our 40-point sustainability checklist  covering water use, waste management, energy sources, and local hiring practices.',
        stat: '200+ certified partners',
    },
];

const COMMITMENTS = [
    { year: '2018', text: 'Founded with a low-impact-first charter  sustainability was not an afterthought, it was the starting point.' },
    { year: '2020', text: 'Joined the Global Sustainable Tourism Council (GSTC) and aligned all partner lodges to its standards.' },
    { year: '2022', text: 'Launched our community bursary fund, sending 120 young Africans to wildlife and hospitality training programmes.' },
    { year: '2024', text: 'Became carbon-neutral across all Gokusafiri operations  flights, accommodation, and ground transport included.' },
    { year: '2026', text: 'Target: 10% of net revenue to go directly to conservation and community projects annually.' },
];

export default function Sustainability() {
    const { locale } = usePage<PageProps>().props;
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Sustainability  Gokusafiri" />

            {/* Hero */}
            <section className="relative bg-[#2e4a39] py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/images/hero-safari.jpg" alt="" className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="relative max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        Our commitment
                    </p>
                    <h1 className="font-display not-italic text-[42px] leading-[50px] md:text-[64px] md:leading-[70px] tracking-[-0.62px] text-white max-w-[640px] mb-6">
                        Travel that gives back
                    </h1>
                    <p className="text-[16px] leading-[26px] text-white/75 max-w-[520px]">
                        Every safari you book with us is designed to protect the wildlife, support the communities, and preserve the landscapes that make Africa extraordinary.
                    </p>
                </div>
            </section>

            {/* Four pillars */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="text-center mb-14">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">How we do it</p>
                        <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b]">
                            Four pillars of responsible travel
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {PILLARS.map(({ icon: Icon, title, body, stat }) => (
                            <div key={title} className="bg-white rounded-[22px] p-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-full bg-[#eef3ec] flex items-center justify-center shrink-0">
                                        <Icon size={22} className="text-[#6e8c79]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-[18px] text-[#16241b] mb-2">{title}</h3>
                                        <p className="text-[14px] leading-[22px] text-[#4f5c53] mb-4">{body}</p>
                                        <span className="inline-block px-3 py-1.5 rounded-full bg-[#eef3ec] text-[#2e4a39] text-[13px] font-semibold">
                                            {stat}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-[#16241b] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="text-center mb-12">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">Our journey</p>
                        <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-white">
                            Milestones in responsible travel
                        </h2>
                    </div>
                    <div className="max-w-[680px] mx-auto space-y-0">
                        {COMMITMENTS.map(({ year, text }, i) => (
                            <div key={year} className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#f0a05e] flex items-center justify-center shrink-0">
                                        <span className="text-[11px] font-bold text-[#16241b]">{year}</span>
                                    </div>
                                    {i < COMMITMENTS.length - 1 && (
                                        <div className="w-px flex-1 bg-white/20 my-1" style={{ minHeight: '32px' }} />
                                    )}
                                </div>
                                <div className="pb-8 pt-2">
                                    <p className="text-[15px] leading-[24px] text-white/80">{text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What you can do */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">Your role</p>
                            <h2 className="font-display not-italic text-[32px] md:text-[44px] tracking-[-0.62px] text-[#16241b] mb-5">
                                You're part of the solution
                            </h2>
                            <p className="text-[15px] leading-[24px] text-[#4f5c53] mb-4">
                                Tourism, when done right, is one of the most powerful conservation tools Africa has. Every safari you book funds the rangers, the community schools, and the anti-poaching patrols that keep these wild places alive.
                            </p>
                            <p className="text-[15px] leading-[24px] text-[#4f5c53]">
                                When you travel with Gokusafiri, you don't just witness Africa  you actively help protect it.
                            </p>
                        </div>
                        <div className="bg-[#fbf8f2] rounded-[22px] p-8 space-y-5">
                            {[
                                { pct: '100%', label: 'of bookings include carbon offset' },
                                { pct: '25%', label: 'of tour fees go to local communities' },
                                { pct: '200+', label: 'conservation-certified lodge partners' },
                                { pct: '30+', label: 'conservation NGO partnerships' },
                            ].map(({ pct, label }) => (
                                <div key={label} className="flex items-center gap-4">
                                    <span className="font-display not-italic text-[28px] text-[#6e8c79] min-w-[70px]">{pct}</span>
                                    <span className="text-[14px] text-[#4f5c53]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#fbf8f2] py-14">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 text-center">
                    <h2 className="font-display not-italic text-[28px] md:text-[38px] tracking-[-0.62px] text-[#16241b] mb-4">
                        Book a journey that matters
                    </h2>
                    <p className="text-[15px] text-[#4f5c53] mb-8 max-w-[420px] mx-auto">
                        Every safari we offer meets our full sustainability standard. Start exploring.
                    </p>
                    <Link
                        href={`${p}/packages`}
                        className="inline-flex px-[28px] py-[14px] rounded-full bg-[#6e8c79] text-white text-[15px] font-medium hover:bg-[#5a7865] transition-colors"
                    >
                        Explore safaris
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}
