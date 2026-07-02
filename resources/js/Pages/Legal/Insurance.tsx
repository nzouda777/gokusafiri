import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { ShieldCheck, AlertTriangle, Phone, FileText } from 'lucide-react';
import type { PageProps } from '../../types';

const COVERAGE_TYPES = [
    {
        icon: ShieldCheck,
        title: 'Trip cancellation & interruption',
        body: 'Reimburses non-refundable costs if you must cancel or cut short your trip due to illness, injury, bereavement, or other covered events. This is the most important coverage for safaris.',
    },
    {
        icon: AlertTriangle,
        title: 'Medical & emergency evacuation',
        body: 'Covers medical treatment abroad and, critically, emergency evacuation from remote areas. Medical evacuation from the African bush can cost $50,000 or more without insurance.',
    },
    {
        icon: Phone,
        title: '24/7 emergency assistance',
        body: 'Access to a global assistance hotline that can coordinate with local hospitals, consulates, and our own operations team if something goes wrong.',
    },
    {
        icon: FileText,
        title: 'Baggage & personal effects',
        body: 'Protection against lost, stolen, or delayed luggage  especially important for camera equipment, specialist gear, and valuables on multi-country itineraries.',
    },
];

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <h2 className="font-semibold text-[20px] text-[#16241b] mb-4 pb-3 border-b border-[#e4ddd0]">{title}</h2>
            <div className="text-[15px] leading-[26px] text-[#4f5c53] space-y-3">{children}</div>
        </div>
    );
}

export default function Insurance() {
    const { locale } = usePage<PageProps>().props;
    const p = `/${locale}`;

    return (
        <AppLayout>
            <Head title="Travel Insurance  Gokusafiri" />

            {/* Header */}
            <section className="bg-[#16241b] py-16 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">Support</p>
                    <h1 className="font-display not-italic text-[38px] leading-[46px] md:text-[56px] md:leading-[62px] tracking-[-0.62px] text-white mb-3">
                        Travel insurance
                    </h1>
                    <p className="text-[16px] text-white/70 max-w-[480px] mt-4">
                        We don't sell insurance  but we strongly recommend it. Here's everything you need to know.
                    </p>
                </div>
            </section>

            {/* Why it matters */}
            <section className="bg-[#fbf8f2] py-16">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="bg-[#2e4a39] rounded-[22px] p-8 md:p-10 text-white">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">Why it matters</p>
                        <h2 className="font-display not-italic text-[28px] md:text-[38px] tracking-[-0.62px] text-white mb-4">
                            Africa is extraordinary  and remote
                        </h2>
                        <p className="text-[15px] leading-[26px] text-white/80 max-w-[640px]">
                            The Maasai Mara is two hours from Nairobi by light aircraft. Bwindi Impenetrable Forest is a four-wheel-drive journey from the nearest hospital. The wild places that make Africa so special are also places where proper insurance can make a life-changing difference if the unexpected happens.
                        </p>
                    </div>
                </div>
            </section>

            {/* Coverage types */}
            <section className="bg-white py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="mb-10">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">What to look for</p>
                        <h2 className="font-display not-italic text-[32px] md:text-[40px] tracking-[-0.62px] text-[#16241b]">
                            Recommended coverage types
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {COVERAGE_TYPES.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="bg-[#fbf8f2] rounded-[20px] p-7">
                                <div className="w-10 h-10 rounded-full bg-[#eef3ec] flex items-center justify-center mb-4">
                                    <Icon size={18} className="text-[#6e8c79]" />
                                </div>
                                <h3 className="font-semibold text-[16px] text-[#16241b] mb-2">{title}</h3>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53]">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ-style content */}
            <section className="bg-white py-4 md:py-8">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[820px]">

                        <LegalSection title="Pre-existing medical conditions">
                            <p>
                                Many standard travel insurance policies exclude pre-existing medical conditions unless you declare them at the time of purchase. We recommend selecting a policy that explicitly covers declared conditions, especially for longer or physically demanding safaris.
                            </p>
                            <p>
                                Always read the policy's medical exclusion clauses carefully before purchasing.
                            </p>
                        </LegalSection>

                        <LegalSection title="Activities coverage">
                            <p>
                                Ensure your policy covers all activities on your itinerary. Some policies exclude hiking, wildlife game drives, scuba diving, gorilla trekking, or hot-air balloon rides unless you add a specific activities rider.
                            </p>
                            <p>
                                Check that the policy covers the full value of your booking, including the deposit.
                            </p>
                        </LegalSection>

                        <LegalSection title="When to buy">
                            <p>
                                Purchase travel insurance as soon as you make your first payment. This activates "cancel for any reason" benefits (where available) and protects your deposit immediately. Waiting until close to departure reduces your coverage window significantly.
                            </p>
                        </LegalSection>

                        <LegalSection title="Our recommendation">
                            <p>
                                We recommend specialist travel insurance providers with strong Africa coverage, such as World Nomads, Battleface, or AIG Travel Guard. Your home country's insurance provider may also offer adequate coverage  check before buying a new policy.
                            </p>
                            <p>
                                Gokusafiri does not receive any referral fees or commissions from insurance providers. Our recommendations are based solely on coverage quality.
                            </p>
                        </LegalSection>

                        <div className="pt-4 border-t border-[#e4ddd0]">
                            <p className="text-[14px] text-[#8a968d]">
                                Have more questions?{' '}
                                <Link href={`${p}/contact`} className="text-[#6e8c79] hover:underline">Contact our team</Link>{' '}
                                 we're happy to help you find the right coverage for your journey.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
