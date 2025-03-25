'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getCurrentUser } from '@/services/authService';
import { parseJwt } from '@/lib/jwtParse';
import { fetchUserData } from '@/lib/fetchUser';
import { fetchCoins } from '@/lib/fetchCoin';

const Logout = dynamic(() => import('../components/Logout'), {
    ssr: false,
});

const Dashboard: React.FC = () => {
    const router = useRouter();
    const [uuid, setUuid] = useState<string | null>(null);
    const [coins, setCoins] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            router.push('/login');
        } else {
            const parsedToken = parseJwt(currentUser);
            if (parsedToken?.uuid) {
                setUuid(parsedToken.uuid);
                fetchUserAndCoinData(parsedToken.uuid);
            }
        }
    }, [router]);

    const fetchUserAndCoinData = async (uuid: string) => {
        try {
            const [userData, userCoins] = await Promise.all([
                fetchUserData(uuid),
                fetchCoins(uuid),
            ]);

            if (userData) {
                setUsername(userData.username);
                setEmail(userData.email);
            }
            setCoins(userCoins);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Logout />
            <p className="mt-4">
                <strong>UUID:</strong> {uuid}
            </p>
            <p>
                <strong>Username:</strong> {username}
            </p>
            <p>
                <strong>Email:</strong> {email}
            </p>
            <p>
                <strong>Coin Balance:</strong> {coins !== null ? coins : 'N/A'}
            </p>
        </div>
    );
}

export default Dashboard;