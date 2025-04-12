'use client'
import React, { useState } from 'react';
import { register } from '@/services/authService';
import axios from 'axios';
import LogRegBar from '../../components/LogRegBar';
import InputField from '../../components/inputField';
import Container from '../../components/Container';
import Button from '../../components/Button';

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
        <Container>

            <LogRegBar disableRegister={true} />

            <div className="flex justify-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Register</h1>
            </div>

            {error && <p className="mb-4 text-center text-red-500">{error}</p>}
            {success && <p className="mb-4 text-center text-green-500">{success}</p>}

            <form onSubmit={handleSubmit} className="w-full">

                <InputField
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    label="Username"
                    required={true}
                />

                <InputField
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email"
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

                <InputField
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    label="confirm password"
                    required={true}
                />

                <Button type="submit" label="Register" />

            </form>
        </Container >
    );
};
