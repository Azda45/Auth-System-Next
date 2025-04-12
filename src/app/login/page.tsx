'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginService, getCurrentUser } from '@/services/authService';
import LogRegBar from '../../components/LogRegBar';
import InputField from '../../components/inputField';
import Container from '../../components/Container';
import Button from '../../components/Button';
export default function Login() {
    const router = useRouter();
    useEffect(() => {
        const token = getCurrentUser();

        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await loginService({ login: loginInput, password });

            if (result && result.token) {
                localStorage.setItem('token', result.token);
                router.push('/dashboard');
            } else {
                setError('Login failed');
            }
        } catch (error) {
            setError('Login failed');
            console.error('Login error:', error);
        }
    };

    return (
        <Container>
            <LogRegBar disableLogin={true} />
            <div className="flex justify-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Login</h1>
            </div>
            {error && <p className='mb-4 text-center text-red-500'>{error}</p>}

            <form onSubmit={handleSubmit}>

                <InputField
                    id="login"
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    label="Username or Email"
                    required={true}
                />

                <InputField
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="password"
                    required={true}
                />

                <div className="text-right mb-4 mt-0.5">
                    <a
                        onClick={() => router.push('/reset-password')}
                        className="text-sm text-blue-600 hover:underline cursor-pointer"
                    >
                        Forgot password?
                    </a>
                </div>

                <Button type="submit" label="Login" />

            </form>
        </Container>
    );
}
