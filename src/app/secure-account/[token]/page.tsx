// src/app/secure-account/[token]/page.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import InputField from "@/components/inputField";

const SecureAccountPage = () => {
    const params = useParams();
    const token = params.token as string;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const validatePassword = () => {
        if (password.length < 8) {
            setError("Password harus minimal 8 karakter");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return false;
        }
        setError("");
        return true;
    };

    const handleSecure = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/secure-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage("Password berhasil diubah! Silahkan login ulang.");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setError(data.message || "Terjadi kesalahan");
            }
        } catch (err) {
            setError("Terjadi kesalahan pada server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Secure Account</h1>
            <form onSubmit={handleSecure}>
                <InputField
                    id="password"
                    type="password"
                    label="Password Baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <InputField
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    {loading ? "Loading..." : "Reset Password"}
                </button>
                {message && <p className="mt-4 text-green-500">{message}</p>}
            </form>
        </div>
    );
};

export default SecureAccountPage;