'use client'
import { useState } from "react";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const resetPassword = async () => {
        const apikey = process.env.NEXT_PUBLIC_API_KEY; // Ambil API key dari environment variable

        // Periksa apakah API key tersedia
        if (!apikey) {
            setMessage("API Key is missing.");
            return;
        }

        const res = await fetch("/api/reset-password", {
            method: "POST",
            body: JSON.stringify({ email, otp, newPassword }),
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apikey, // Pastikan API key tersedia
            },
        });

        const data = await res.json();
        setMessage(data.message);
    };

    return (
        <div>
            <h1>Reset Password</h1>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
            />
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
            />
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
            />
            <button onClick={resetPassword}>Reset Password</button>
            {message && <p>{message}</p>}
        </div>
    );
}
