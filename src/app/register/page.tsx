'use client'
import React, { useState } from 'react';
import { register } from '@/services/authService';
import axios from 'axios';
import LogRegBar from '../components/LogRegBar';
import InputField from '../components/inputField';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const userData = {
            username,
            email,
            password,
        };

        try {
            await register(userData);
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('Registration successful!');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                const message = err.response.data?.msg || 'Registration failed';
                setError(message);
            } else {
                setError('Registration failed');
            }
            setSuccess('');
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm border border-gray-300 dark:border-gray-600 outline outline-1 outline-gray-300 dark:outline-gray-600">

                    <LogRegBar disableRegister={true} />

                    <div className="flex justify-center">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Register</h1>
                    </div>
                    {error && <p className="mb-5 font-medium text-red-500">{error}</p>}
                    {success && <p className="mb-5 font-medium text-green-500">{success}</p>}
                    <form onSubmit={handleSubmit} className="w-full">

                        <InputField
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            label="Username"
                        />
                        <InputField
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            label="Email"
                        />
                        <InputField
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="password"
                        />
                        <InputField
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            label="confirm password"
                        />

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg border border-blue-700 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
