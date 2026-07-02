import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        terms: false,
        marketing: false,
    });

    const strength = !data.password ? '' : data.password.length < 6 ? 'Bad' : data.password.length < 10 ? 'Fair' : 'Good';
    const strengthColor = strength === 'Bad' ? 'bg-red-400' : strength === 'Fair' ? 'bg-yellow-400' : 'bg-green-500';

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/register');
    }

    return (
        <div className="min-h-screen flex">
            <Head title="Create account" />

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
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white overflow-y-auto py-8">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex border-b border-gray-200 mb-8">
                        <Link href="/login" className="pb-3 px-1 text-sm font-medium text-gray-400 hover:text-[#1F2937] mr-6">Sign in</Link>
                        <Link href="/register" className="pb-3 px-1 text-sm font-semibold text-[#1F2937] border-b-2 border-[#1F2937]">Create account</Link>
                    </div>

                    <h1 className="font-serif text-3xl font-bold text-[#1F2937] mb-2">Create your account</h1>
                    <p className="text-sm text-gray-500 mb-8">Join 120,000+ travelers. Free to create, cancel any time.</p>

                    <a href="/auth/google" className="flex items-center justify-center gap-3 w-full py-3 rounded-full border border-gray-300 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors mb-6">
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10.341 10.341 0 0 0-.164-1.841H9v3.481h4.844A4.14 4.14 0 0 1 12.077 13v2.455h2.907C16.657 13.935 17.64 11.77 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.907-2.455C11.242 14.1 10.178 14.5 9 14.5c-3.132 0-5.784-2.155-6.733-5.052H-.21v2.53A9.003 9.003 0 0 0 9 18z" fill="#34A853"/><path d="M2.267 9.448A5.418 5.418 0 0 1 2.5 8a5.418 5.418 0 0 1 .233-.9V4.57h-3.233A9.003 9.003 0 0 0 0 9c0 1.452.348 2.826.967 4.043l2.3-1.595z" fill="#FBBC05"/><path d="M9 3.5c1.321 0 2.508.455 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A9.003 9.003 0 0 0-.21 4.57l3.477 2.648C4.216 5.655 6.868 3.5 9 3.5z" fill="#EA4335"/></svg>
                        Continue with Google
                    </a>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or sign up with email</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First name</label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    placeholder="Jane"
                                    className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                                />
                                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last name</label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                                />
                                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                            />
                            {data.password && (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                                        <div className={`h-full rounded-full ${strengthColor} transition-all`} style={{ width: strength === 'Bad' ? '33%' : strength === 'Fair' ? '66%' : '100%' }} />
                                    </div>
                                    <span className={`text-xs font-medium ${strength === 'Bad' ? 'text-red-500' : strength === 'Fair' ? 'text-yellow-600' : 'text-green-600'}`}>{strength}</span>
                                </div>
                            )}
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.terms} onChange={e => setData('terms', e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#2C4A3B] rounded" />
                            <span className="text-sm text-gray-600">
                                I agree to Gokusafiri's{' '}
                                <a href="#" className="text-[#1F2937] underline">Terms</a>{' '}and{' '}
                                <a href="#" className="text-[#1F2937] underline">Privacy Policy</a>
                            </span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.marketing} onChange={e => setData('marketing', e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#2C4A3B] rounded" />
                            <span className="text-sm text-gray-600">Send me exclusive deals and early-access safari launches</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing || !data.terms}
                            className="w-full py-3.5 rounded-full bg-[#2C4A3B] text-white font-semibold hover:bg-[#3a5c4a] transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Creating account…' : 'Create free account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-[#1F2937] hover:text-[#2C4A3B]">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
