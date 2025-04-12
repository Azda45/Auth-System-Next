'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../../components/inputField';
import LogRegBar from '../../components/LogRegBar';
import Container from '../../components/Container';
import Button from '../../components/Button';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'request' | 'otp' | 'reset'>('request');

    const router = useRouter();

    const sendOtp = async () => {
        if (!email) {
            setErrorMessage('Email is required');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message);
                setStep('otp');
            } else {
                setErrorMessage(data.message || 'Error sending OTP. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Error sending OTP. Please try again.');
        }

        setLoading(false);
    };

    const verifyOtp = async () => {
        if (!email || !otp) {
            setErrorMessage('Email and OTP are required');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccessMessage(data.message || 'OTP verified. Please enter your new password.');
                setStep('reset');
            } else {
                setErrorMessage(data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Error verifying OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!email || !otp || !newPassword || !confirmPassword) {
            setErrorMessage('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const apikey = process.env.NEXT_PUBLIC_API_KEY as string;

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email, otp, newPassword }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apikey,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message);
                sessionStorage.setItem('passwordResetSuccess', 'true');
                router.push('/password-success');
            } else {
                setErrorMessage(data.message || 'Error resetting password. Please try again.');
            }
        } catch (error) {
            setErrorMessage('Error resetting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <LogRegBar disableLogin={false} />
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                {step === 'request' ? 'Request OTP' : step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            </h1>

            {successMessage && <p className="mb-4 text-center text-green-500">{successMessage}</p>}
            {errorMessage && <p className="mb-4 text-center text-red-500">{errorMessage}</p>}

            <div className="space-y-4">
                {step === 'request' && (
                    <InputField
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                    />
                )}

                {step === 'otp' && (
                    <>
                        <InputField
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            label="OTP"
                        />
                    </>
                )}

                {step === 'reset' && (
                    <>
                        <InputField
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            label="New Password"
                        />
                        <InputField
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            label="Confirm New Password"
                        />
                    </>
                )}

                <Button
                    onClick={
                        step === 'request' ? sendOtp : step === 'otp' ? verifyOtp : resetPassword
                    }
                    disabled={loading}
                    label={
                        loading
                            ? 'Processing...'
                            : step === 'request'
                                ? 'Send OTP'
                                : step === 'otp'
                                    ? 'Verify OTP'
                                    : 'Reset Password'
                    }
                />
            </div>
        </Container>
    );
}
