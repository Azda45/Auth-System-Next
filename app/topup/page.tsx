'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../services/authService';
import { parseJwt } from '../../lib/jwtParse';
import { fetchUserData } from '../../lib/fetchUser';
import { fetchCoins } from '../../lib/fetchCoin';

const Topup: React.FC = () => {
    const router = useRouter();
    const [coins, setCoins] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState(70);

    const coinPackages = [
        { amount: 70, price: 12900 },
        { amount: 90, price: 16600 },
        { amount: 150, price: 27700 },
        { amount: 200, price: 36500 },
        { amount: 250, price: 46100 },
        { amount: 350, price: 64500 },
        { amount: 450, price: 82900 },
        { amount: 600, price: 100000 },
        { amount: 650, price: 110000 },
    ];

    useEffect(() => {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            router.push('/login');
        } else {
            const parsedToken = parseJwt(currentUser);
            if (parsedToken?.uuid) {
                // Memanggil fetchUserData dan fetchCoins secara paralel
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
            }
            setCoins(userCoins);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCoinSelect = (amount: number) => setSelectedCoin(amount);

    const formatCurrency = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-500"></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg border-2 border-gray-300">
                <div className="flex justify-center space-x-2 mb-6">
                    <h2 className="text-xl font-semibold">Coin Top Up</h2>
                </div>

                <div className="mb-6 text-center">
                    <p className="font-semibold">{username}</p>
                    <p className="font-semibold">Balance: {coins !== null ? coins : 'N/A'}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {coinPackages.map((coin) => (
                        <button
                            key={coin.amount}
                            className={`p-6 border rounded-lg font-semibold text-center transition-colors duration-200 ${selectedCoin === coin.amount
                                ? 'border-blue-500 bg-blue-100 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onClick={() => handleCoinSelect(coin.amount)}
                        >
                            <div className="text-lg">{coin.amount} 🪙</div>
                            <div className="text-sm text-gray-600">
                                {formatCurrency(coin.price)}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-lg font-semibold">
                        {formatCurrency(coinPackages.find((c) => c.amount === selectedCoin)?.price || 0)}
                    </p>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors duration-200">
                    TopUp
                </button>
            </div>
        </div>
    );
};

export default Topup;
