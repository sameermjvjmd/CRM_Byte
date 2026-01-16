import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Loader2,
    AlertCircle,
    CheckCircle,
    Building2,
    Globe,
    User,
    Mail,
    Lock,
    Sparkles,
    Zap,
    Shield,
    Users
} from 'lucide-react';
import authApi from '../api/authApi';
import type { RegisterTenantRequest } from '../types/auth';

const plans = [
    {
        id: 'Free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        features: ['Up to 5 users', 'Basic CRM features', 'Email support', '1GB storage'],
        icon: Zap,
        popular: false
    },
    {
        id: 'Pro',
        name: 'Pro',
        price: '$29',
        period: 'per user/month',
        features: ['Unlimited users', 'Advanced analytics', 'Priority support', '50GB storage', 'API access'],
        icon: Sparkles,
        popular: true
    },
    {
        id: 'Enterprise',
        name: 'Enterprise',
        price: 'Custom',
        period: 'contact us',
        features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'Unlimited storage', 'SLA guarantee'],
        icon: Shield,
        popular: false
    }
];

const RegisterTenantPage = () => {
    const navigate = useNavigate();

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('Free');
    const [showPassword, setShowPassword] = useState(false);

    // UI state
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subdomain check state
    const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [subdomainMessage, setSubdomainMessage] = useState<string>('');

    // Auto-generate subdomain from company name
    useEffect(() => {
        if (companyName && !subdomain) {
            const generated = companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '')
                .substring(0, 20);
            setSubdomain(generated);
        }
    }, [companyName, subdomain]);

    // Check subdomain availability with debounce
    const checkSubdomain = useCallback(async (value: string) => {
        if (value.length < 3) {
            setSubdomainAvailable(null);
            setSubdomainMessage('Subdomain must be at least 3 characters');
            return;
        }

        setIsCheckingSubdomain(true);
        try {
            const result = await authApi.checkSubdomain(value);
            setSubdomainAvailable(result.available);
            setSubdomainMessage(result.message || '');
        } catch {
            setSubdomainAvailable(null);
            setSubdomainMessage('Could not check availability');
        } finally {
            setIsCheckingSubdomain(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (subdomain.length >= 3) {
                checkSubdomain(subdomain);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [subdomain, checkSubdomain]);

    const handleSubdomainChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setSubdomain(sanitized);
        setSubdomainAvailable(null);
    };

    const validateStep1 = (): boolean => {
        if (!companyName.trim()) {
            setError('Company name is required');
            return false;
        }
        if (subdomain.length < 3) {
            setError('Subdomain must be at least 3 characters');
            return false;
        }
        if (!subdomainAvailable) {
            setError('Please choose an available subdomain');
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        if (!adminName.trim()) {
            setError('Your name is required');
            return false;
        }
        if (!adminEmail.trim() || !adminEmail.includes('@')) {
            setError('Valid email is required');
            return false;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        setError(null);
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);

        const request: RegisterTenantRequest = {
            subdomain,
            companyName,
            adminEmail,
            adminPassword: password,
            adminName,
            plan: selectedPlan
        };

        try {
            const result = await authApi.registerTenant(request);

            if (result.success) {
                // Redirect to login with success message
                navigate(`/login?registered=true&subdomain=${subdomain}`);
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative w-full max-w-4xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-xl">Nx</span>
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-black text-white tracking-tight">NEXUS CRM</h1>
                            <p className="text-indigo-300 text-sm">Start your journey</p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                {step > s ? <CheckCircle size={20} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-1 mx-2 rounded transition-all ${step > s ? 'bg-indigo-600' : 'bg-slate-800'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="max-w-lg mx-auto mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: Organization Info */}
                {step === 1 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">Create your organization</h2>
                        <p className="text-slate-400 mb-6">Tell us about your company</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Building2 className="inline w-4 h-4 mr-2" />
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Acme Inc."
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Globe className="inline w-4 h-4 mr-2" />
                                    Your Subdomain
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={subdomain}
                                            onChange={(e) => handleSubdomainChange(e.target.value)}
                                            placeholder="yourcompany"
                                            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 outline-none transition-all ${subdomainAvailable === true
                                                    ? 'border-green-500 focus:ring-green-500/20'
                                                    : subdomainAvailable === false
                                                        ? 'border-red-500 focus:ring-red-500/20'
                                                        : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                                                }`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isCheckingSubdomain && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
                                            {!isCheckingSubdomain && subdomainAvailable === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            {!isCheckingSubdomain && subdomainAvailable === false && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    </div>
                                    <span className="text-slate-400 text-sm">.nexuscrm.com</span>
                                </div>
                                {subdomainMessage && (
                                    <p className={`text-sm mt-2 ${subdomainAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                        {subdomainMessage}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep}
                            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                        >
                            Continue
                        </button>

                        <p className="text-center text-slate-400 text-sm mt-6">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300">
                                Sign in
                            </Link>
                        </p>
                    </div>
                )}

                {/* Step 2: Admin Account */}
                {step === 2 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-2">Create your admin account</h2>
                        <p className="text-slate-400 mb-6">You'll be the first admin of {companyName}</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <User className="inline w-4 h-4 mr-2" />
                                    Your Full Name
                                </label>
                                <input
                                    type="text"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    placeholder="John Smith"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Mail className="inline w-4 h-4 mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="john@yourcompany.com"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Lock className="inline w-4 h-4 mr-2" />
                                    Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Lock className="inline w-4 h-4 mr-2" />
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />
                                Show passwords
                            </label>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNextStep}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Select Plan */}
                {step === 3 && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Choose your plan</h2>
                            <p className="text-slate-400">Start free, upgrade anytime</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {plans.map((plan) => {
                                const Icon = plan.icon;
                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id
                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-full">
                                                POPULAR
                                            </div>
                                        )}
                                        <Icon className={`w-8 h-8 mb-4 ${selectedPlan === plan.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                                        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-black text-white">{plan.price}</span>
                                            <span className="text-slate-400 text-sm">/{plan.period}</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-4">Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Organization</span>
                                    <span className="text-white font-medium">{companyName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Subdomain</span>
                                    <span className="text-white font-medium">{subdomain}.nexuscrm.com</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Admin</span>
                                    <span className="text-white font-medium">{adminEmail}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Plan</span>
                                    <span className="text-indigo-400 font-medium">{selectedPlan}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                disabled={isLoading}
                                className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating your organization...
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-5 h-5" />
                                        Create Organization
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-slate-500 text-xs mt-6">
                            By creating an organization, you agree to our{' '}
                            <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterTenantPage;
