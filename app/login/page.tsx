'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginService, getCurrentUser } from '../../services/authService';
import LogRegBar from '../components/LogRegBar';

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
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                placeholder=" "
                                required
                                id='login'
                                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 dark:border-gray-600 outline-none dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            />
                            <label
                                htmlFor='login'
                                className="cursor-text absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                Username or Email
                            </label>
                        </div>

                        <div className="relative mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                required
                                id='password'
                                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 dark:border-gray-600 outline-none dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            />
                            <label
                                htmlFor='password'
                                className="cursor-text absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-800 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                Password
                            </label>
                        </div>

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
