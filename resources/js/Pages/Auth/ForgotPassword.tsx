import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    status?: string;
}

export default function ForgotPassword({ status }: Props) {
    const { data, setData, post, processing } = useForm({ email: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <div className="min-h-screen flex">
            <Head title="Reset your password" />

            {/* Left panel */}
            <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-10 bg-[#2C4A3B]">
                <img src="/images/auth-safari.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity='0'; }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
                <div className="relative z-10">
                    <img src="/images/logo-white.svg" alt="GöKusafiri" className="h-10 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <div className="relative z-10">
                    <blockquote className="font-serif text-2xl font-bold text-white leading-relaxed mb-6">
                        "Africa changes you. It doesn't just give you memories  it gives you a different way of seeing the world."
                    </blockquote>
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 overflow-hidden">
                                    <img src={`/images/avatar-${i}.jpg`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                                </div>
                            ))}
                        </div>
                        <p className="text-white text-sm"><strong>125 000+ travelers</strong> already on safari</p>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {[['120k+', 'Happy travelers'], ['14', 'Countries'], ['4.9★', 'Average rating']].map(([val, label]) => (
                            <div key={label}>
                                <p className="font-serif text-3xl font-bold text-white">{val}</p>
                                <p className="text-sm text-white/70">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <h1 className="font-serif text-3xl font-bold text-[#1F2937] mb-2">Reset your password</h1>
                    <p className="text-sm text-gray-500 mb-8">Enter your email and we'll send a reset link within 2 minutes.</p>

                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 text-sm text-green-700 border border-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 rounded-full bg-[#2C4A3B] text-white font-semibold hover:bg-[#3a5c4a] transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-[#2C4A3B]">
                            ← Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
