"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordSuccess() {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const isRedirected = sessionStorage.getItem("passwordResetSuccess");
        if (isRedirected) {
            setIsAllowed(true);
        } else {
            router.replace("/login"); // Redirect jika diakses langsung
        }
    }, [router]);

    const handleGoToLogin = () => {
        sessionStorage.removeItem("passwordResetSuccess"); // Hapus saat user klik tombol
        router.push("/login");
    };

    if (!isAllowed) return null; // Mencegah tampilan sebelum verifikasi selesai

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
                <h1 className="text-2xl font-bold text-green-600">Password Changed Successfully!</h1>
                <p className="text-gray-600 mt-2">You can now log in with your new password.</p>
                <button
                    onClick={handleGoToLogin}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Go to Login
                </button>
            </div>
        </div>

    );
}