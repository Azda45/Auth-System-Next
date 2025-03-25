"use client";
import { useState } from "react";

export default function RequestOtp() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const sendOtp = async () => {
        const res = await fetch("/api/send-otp", {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        setMessage(data.message);
    };

    return (
        <div>
            <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={sendOtp}>Send OTP</button>
            {message && <p>{message}</p>}
        </div>
    );
}
