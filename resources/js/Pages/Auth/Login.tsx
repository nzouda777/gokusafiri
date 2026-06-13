import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen flex">
            <Head title="Sign in" />

            {/* Left panel: safari image + quote */}
            <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-10 bg-[#2C4A3B]">
                <img
                    src="/images/auth-safari.jpg"
                    alt="African safari"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity='0'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />

                <div className="relative z-10">
                    <img src="/images/logo-white.svg" alt="GöKusafiri" className="h-10 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>

                <div className="relative z-10">
                    <blockquote className="font-serif text-2xl font-bold text-white leading-relaxed mb-6">
                        "Africa changes you. It doesn't just give you memories — it gives you a different way of seeing the world."
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
                        {[
                            { val: '120k+', label: 'Happy travelers' },
                            { val: '14', label: 'Countries' },
                            { val: '4.9★', label: 'Average rating' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="font-serif text-3xl font-bold text-white">
                                    {s.val.replace('k', '<span class="text-[#E07A3F]">k</span>')}
                                    <span dangerouslySetInnerHTML={{ __html: s.val.replace(/k\+/, '<span style="color:#E07A3F">k</span>+') }} className="hidden" />
                                    {s.val}
                                </p>
                                <p className="text-sm text-white/70">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel: form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Tab switcher */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <Link href="/login" className="pb-3 px-1 text-sm font-semibold text-[#1F2937] border-b-2 border-[#1F2937] mr-6">
                            Sign in
                        </Link>
                        <Link href="/register" className="pb-3 px-1 text-sm font-medium text-gray-400 hover:text-[#1F2937]">
                            Create account
                        </Link>
                    </div>

                    <h1 className="font-serif text-3xl font-bold text-[#1F2937] mb-2">Welcome back</h1>
                    <p className="text-sm text-gray-500 mb-8">Sign in to access your trips and saved safaris.</p>

                    {/* Google SSO */}
                    <a
                        href="/auth/google"
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-full border border-gray-300 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors mb-6"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2a10.341 10.341 0 0 0-.164-1.841H9v3.481h4.844A4.14 4.14 0 0 1 12.077 13v2.455h2.907C16.657 13.935 17.64 11.77 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.907-2.455C11.242 14.1 10.178 14.5 9 14.5c-3.132 0-5.784-2.155-6.733-5.052H-.21v2.53A9.003 9.003 0 0 0 9 18z" fill="#34A853"/><path d="M2.267 9.448A5.418 5.418 0 0 1 2.5 8a5.418 5.418 0 0 1 .233-.9V4.57h-3.233A9.003 9.003 0 0 0 0 9c0 1.452.348 2.826.967 4.043l2.3-1.595z" fill="#FBBC05"/><path d="M9 3.5c1.321 0 2.508.455 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A9.003 9.003 0 0 0-.21 4.57l3.477 2.648C4.216 5.655 6.868 3.5 9 3.5z" fill="#EA4335"/></svg>
                        Continue with Google
                    </a>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or sign in with email</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-[#2C4A3B]">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-[10px] border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2C4A3B]"
                            />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="w-4 h-4 accent-[#2C4A3B] rounded"
                            />
                            <span className="text-sm text-gray-600">Keep me signed in</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 rounded-full bg-[#2C4A3B] text-white font-semibold hover:bg-[#3a5c4a] transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-semibold text-[#1F2937] hover:text-[#2C4A3B]">Create one free</Link>
                    </p>

                    {/* Guest booking */}
                    <div className="mt-6 p-4 rounded-xl border border-gray-200 text-center">
                        <p className="text-sm text-gray-500 mb-3">Booking without an account?</p>
                        <Link
                            href="/tours"
                            className="block w-full py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors"
                        >
                            Continue as guest
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
