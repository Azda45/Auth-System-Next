"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import InputField from "../components/inputField";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // Tambahkan state konfirmasi password
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("request");

    const router = useRouter(); // Inisialisasi router

    const sendOtp = async () => {
        if (!email) {
            setMessage("Email is required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/send-otp", {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            setMessage(data.message);
            if (res.ok) setStep("reset");
        } catch (error) {
            setMessage("Error sending OTP. Please try again.");
        }
        setLoading(false);
    };

    const resetPassword = async () => {
        if (!email || !otp || !newPassword || !confirmPassword) {
            setMessage("All fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match"); // Validasi jika password tidak cocok
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                body: JSON.stringify({ email, otp, newPassword }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            setMessage(data.message);
            if (res.ok) {
                setTimeout(() => {
                    router.push("/password-success"); // Redirect ke halaman sukses
                }, 1500); // Delay agar user bisa baca pesan berhasil
            }
        } catch (error) {
            setMessage("Error resetting password. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div>
            <h1>{step === "request" ? "Request OTP" : "Reset Password"}</h1>

            <InputField
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
            />
            {step === "reset" && (
                <>
                    <InputField
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        label="OTP"
                    />
                    <InputField
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        label="New Password"
                    />
                    <InputField
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        label="Confirm New Password"
                    />
                </>
            )}
            <button onClick={step === "request" ? sendOtp : resetPassword} disabled={loading}>
                {loading ? "Processing..." : step === "request" ? "Send OTP" : "Reset Password"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}
