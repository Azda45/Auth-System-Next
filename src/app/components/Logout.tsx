'use client'
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '../../../services/authService';

export default function Logout() {
    const router = useRouter();
    const token = getCurrentUser();

    if (!token) {
        router.push('/login'); // Redirect to login if not authenticated
    }

    const handleLogout = () => {
        logout();
        router.push('/login'); // Redirect to login after logout
    };

    return (
        <button onClick={handleLogout} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            Logout
        </button>
    );
};
