import { useState, useEffect } from 'react';
import {
    Mail, Server, Send, CheckCircle, XCircle, Loader2,
    AlertCircle, Settings2, Shield, Eye, EyeOff
} from 'lucide-react';
import api from '../../api/api';

interface EmailSettings {
    id: number;
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    enableSsl: boolean;
    fromEmail: string;
    fromName: string;
    replyToEmail?: string;
    isActive: boolean;
    isDefault: boolean;
    providerType: string;
    isVerified: boolean;
    lastVerifiedAt?: string;
    lastVerificationError?: string;
}

interface SmtpProvider {
    name: string;
    smtpHost: string;
    smtpPort: number;
    enableSsl: boolean;
    instructions: string;
}

const EmailSettingsPage = () => {
    const [settings, setSettings] = useState<EmailSettings | null>(null);
    const [providers, setProviders] = useState<SmtpProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string>('Custom');

    const [formData, setFormData] = useState({
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        enableSsl: true,
        fromEmail: '',
        fromName: '',
        replyToEmail: '',
        providerType: 'Custom'
    });

    useEffect(() => {
        loadSettings();
        loadProviders();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await api.get('/EmailSettings');
            setSettings(response.data);
            setFormData({
                smtpHost: response.data.smtpHost || '',
                smtpPort: response.data.smtpPort || 587,
                smtpUsername: response.data.smtpUsername || '',
                smtpPassword: '',
                enableSsl: response.data.enableSsl ?? true,
                fromEmail: response.data.fromEmail || '',
                fromName: response.data.fromName || '',
                replyToEmail: response.data.replyToEmail || '',
                providerType: response.data.providerType || 'Custom'
            });
            setSelectedProvider(response.data.providerType || 'Custom');
        } catch (err) {
            console.error('Failed to load email settings', err);
        } finally {
            setLoading(false);
        }
    };

    const loadProviders = async () => {
        try {
            const response = await api.get('/EmailSettings/providers');
            setProviders(response.data);
        } catch (err) {
            console.error('Failed to load providers', err);
        }
    };

    const handleProviderChange = (providerName: string) => {
        setSelectedProvider(providerName);
        const provider = providers.find(p => p.name === providerName);
        if (provider && provider.smtpHost) {
            setFormData(prev => ({
                ...prev,
                smtpHost: provider.smtpHost,
                smtpPort: provider.smtpPort,
                enableSsl: provider.enableSsl,
                providerType: providerName
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setTestResult(null);

        try {
            await api.post('/EmailSettings', formData);
            await loadSettings();
            setTestResult({ success: true, message: 'Email settings saved successfully!' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        setError(null);

        try {
            const response = await api.post('/EmailSettings/test', formData);
            setTestResult(response.data);
            if (response.data.success) {
                await loadSettings();
            }
        } catch (err: any) {
            setTestResult({
                success: false,
                message: err.response?.data?.message || 'Test failed. Check your settings.'
            });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const currentProvider = providers.find(p => p.name === selectedProvider);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Email Configuration</h1>
                        <p className="text-slate-500">Configure your organization's email settings for sending emails from CRM</p>
                    </div>
                </div>
            </div>

            {settings && (
                <div className={`mb-6 p-4 rounded-xl border ${settings.isVerified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-3">
                        {settings.isVerified ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Email Configuration Verified</p>
                                    <p className="text-sm text-green-600">
                                        Last verified: {settings.lastVerifiedAt ? new Date(settings.lastVerifiedAt).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <div>
                                    <p className="font-medium text-amber-800">Configuration Not Verified</p>
                                    <p className="text-sm text-amber-600">
                                        {settings.lastVerificationError || 'Please save and test your settings to verify the configuration.'}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {testResult && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                        {testResult.message}
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-600" />
                        Email Provider
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {providers.map((provider) => (
                            <button
                                key={provider.name}
                                type="button"
                                onClick={() => handleProviderChange(provider.name)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedProvider === provider.name ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <span className="font-medium text-sm text-slate-700">{provider.name}</span>
                            </button>
                        ))}
                    </div>

                    {currentProvider && currentProvider.instructions && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Setup Instructions:</strong> {currentProvider.instructions}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-600" />
                        SMTP Server Settings
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                SMTP Host <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.smtpHost}
                                onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                                placeholder="smtp.gmail.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                SMTP Port <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.smtpPort}
                                onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                                placeholder="587"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Username / Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.smtpUsername}
                                onChange={(e) => setFormData(prev => ({ ...prev, smtpUsername: e.target.value }))}
                                placeholder="your-email@example.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Password / App Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.smtpPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, smtpPassword: e.target.value }))}
                                    placeholder={settings?.id ? '••••••••' : 'Enter password'}
                                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                For Gmail, use an App Password from your Google Account settings
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.enableSsl}
                                onChange={(e) => setFormData(prev => ({ ...prev, enableSsl: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-600">Enable SSL/TLS encryption</span>
                        </label>
                        <Shield className="w-4 h-4 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        Sender Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                From Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.fromEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                                placeholder="noreply@yourcompany.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                From Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fromName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                                placeholder="Your Company CRM"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                Reply-To Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={formData.replyToEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, replyToEmail: e.target.value }))}
                                placeholder="support@yourcompany.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                If set, replies will go to this address instead of the From Email
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || !formData.smtpHost || !formData.smtpUsername}
                        className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {testing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending Test Email...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send Test Email
                            </>
                        )}
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmailSettingsPage;
