import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { authApi } from '../../api/authApi';

interface TwoFactorSetupProps {
    onComplete: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
    const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'success'>('initial');
    const [secret, setSecret] = useState('');
    const [qrCodeUri, setQrCodeUri] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startSetup = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.setup2FA();
            if (data.success) {
                setSecret(data.secret);
                setQrCodeUri(data.qrCodeUri);
                setStep('qr');
            } else {
                setError('Failed to start 2FA setup.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAndEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const result = await authApi.enable2FA(secret, verificationCode);
            setStep('success');
            if (onComplete) onComplete();
        } catch (err) {
            setError('Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'initial') {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Two-Factor Authentication</h3>
                        <p className="text-slate-500 mt-1 mb-4">
                            Add an extra layer of security to your account by requiring a code from your authenticator app.
                        </p>
                        <button
                            onClick={startSetup}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Enable 2FA
                        </button>
                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="bg-white border border-green-200 rounded-xl p-6 bg-green-50/50">
                <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                        <h3 className="font-semibold">Two-Factor Authentication Enabled</h3>
                        <p className="text-sm text-green-600">Your account is now protected with 2FA.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Setup Two-Factor Authentication</h3>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg flex justify-center">
                        {qrCodeUri && (
                            <QRCodeSVG value={qrCodeUri} size={192} level="H" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-2">Can't scan the code?</p>
                        <code className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-700 font-mono select-all">
                            {secret}
                        </code>
                    </div>
                </div>

                <div className="flex-1">
                    <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-6">
                        <li>Install Google Authenticator or Authy on your phone.</li>
                        <li>Scan the QR code shown here.</li>
                        <li>Enter the 6-digit code from any app below.</li>
                    </ol>

                    <form onSubmit={verifyAndEnable} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000 000"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono tracking-widest text-center text-lg"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('initial')}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || verificationCode.length !== 6}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
