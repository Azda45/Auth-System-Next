'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginService, getCurrentUser } from '@/services/authService';
import LogRegBar from '../components/LogRegBar';
import InputField from '../components/inputField';


export default function Login() {
    const router = useRouter();
    useEffect(() => {
        const token = getCurrentUser();

        // Jika pengguna sudah login, arahkan ke dashboard
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const [loginInput, setLoginInput] = useState(''); // Nama variabel yang jelas
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Panggil service login dengan input login dan password
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
        <div>
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-300 dark:border-gray-600 outline outline-1 outline-gray-300 dark:outline-gray-600">

                    <LogRegBar disableLogin={true} />

                    <div className="flex justify-center">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Login</h1>
                    </div>
                    {error && <p className='mb-5 font-medium text-red-500'>{error}</p>}
                    <form onSubmit={handleSubmit}>

                        <InputField
                            id="login"
                            type="text"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            label="Username or Email"
                        />

                        <InputField
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="password"
                        />

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg border border-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}