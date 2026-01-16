import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get redirect path from location state
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    // Check for success message from registration
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const registered = searchParams.get('registered');
        if (registered) {
            setSuccess('Account created successfully! Please sign in.');
        }
    }, [location.search]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, from]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const result = await login({ email, password, rememberMe });

            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-sans">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 w-full max-w-[420px] flex flex-col items-center text-center">
                {/* Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <span className="text-white font-bold text-2xl tracking-tight">Nx</span>
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h1>
                <p className="text-slate-500 mb-6">Sign in to your account to continue</p>

                {/* Error message */}
                {error && (
                    <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div className="relative">
                        <label className="block text-left text-sm font-medium text-slate-600 mb-1.5">Email</label>
                        <input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-700 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-left text-sm font-medium text-slate-600 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-700 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <label className="flex items-center cursor-pointer text-sm text-slate-600 gap-2 select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            Remember me
                        </label>
                        <a href="#" className="text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-sm text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-sm text-slate-400">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Register link */}
                <p className="text-slate-600 text-sm">
                    New to Nexus?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                        Create an organization
                    </Link>
                </p>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl w-full border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-2">Demo Credentials:</p>
                    <div className="text-xs text-slate-600 space-y-2">
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                            <p><span className="font-medium">Admin:</span> admin@demo.com</p>
                            <p><span className="font-medium">Password:</span> Admin@123</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                            <p><span className="font-medium">User:</span> test@test.com</p>
                            <p><span className="font-medium">Password:</span> Test@123456</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                        Terms of Service and Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
