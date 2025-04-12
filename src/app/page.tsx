"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Container from "../components/Container";
import Button from "../components/Button";
import InputField from "../components/inputField";
import { waitForDebugger } from "inspector";
type PaymentStatus = "idle" | "pending" | "success" | "failed";

export default function TopUpPage() {
  const [formData, setFormData] = useState({ uid: "", coins: "10" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrData, setQrData] = useState<{ qr_code?: string; order_id?: string }>({});
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentDetails, setPaymentDetails] = useState<{
    order_id?: string;
    amount?: number;
    coins_added?: number;
  } | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount).replace("Rp", "Rp.");

  const coins = parseInt(formData.coins || "0", 10);
  const amount = coins * 1000;

  useEffect(() => {
    if (!qrData.order_id || paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/check-payment?order_id=${qrData.order_id}`);
      const data = await res.json();

      if (data.status === "success") {
        setPaymentStatus("success");
        setPaymentDetails({
          order_id: data.order_id,
          amount,
          coins_added: coins,
        });
        setQrData({});
        clearInterval(interval);
      } else if (data.status === "failed") {
        setPaymentStatus("failed");
        setError("Payment failed");
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrData, paymentStatus, coins, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.uid || coins < 1) {
      setError("User ID and minimum 1 coin required");
      return;
    }

    setIsLoading(true);
    setError("");
    setPaymentStatus("idle");

    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: formData.uid, coins }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create QR");

      setQrData(data);
      setPaymentStatus("pending");
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setPaymentStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ uid: "", coins: "10" });
    setPaymentStatus("idle");
    setQrData({});
    setError("");
    setPaymentDetails(null);
  };

  return (
    <Container>
      {paymentStatus === "success" ? (
        <div className="bg-green-100 p-6 rounded-lg text-center">
          <div className="text-4xl text-green-600">✓</div>
          <h2 className="text-xl font-bold mt-2 mb-4">Top Up Successful!</h2>
          <p>Order ID: {paymentDetails?.order_id}</p>
          <p>Total: {formatCurrency(paymentDetails?.amount || 0)}</p>
          <p className="mb-4">Coins: +{paymentDetails?.coins_added}</p>
          <Button onClick={resetForm} label="Top Up Again" />
        </div>
      ) : paymentStatus !== "pending" && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Top Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="uid"
              label="User ID"
              value={formData.uid}
              required
              onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
            />
            <InputField
              id="coins"
              label="Coins"
              type="text"
              inputMode="numeric"
              required
              min="1"
              value={formData.coins}
              onChange={(e) => {
                const val = Math.max(1, parseInt(e.target.value) || 1);
                setFormData({ ...formData, coins: val.toString() });
              }}
            />
            <div className="text-sm text-gray-600">
              Total: <strong>{formatCurrency(amount)}</strong>
            </div>
            <Button type="submit" disabled={isLoading} label={isLoading ? "Loading..." : "Pay"} />
            {error && (
              <div className="bg-red-100 text-red-700 mt-4 p-2 rounded text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      )}

      {paymentStatus === "pending" && qrData.qr_code && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Scan to Pay</h1>
          <div className="mt-8 text-center">
            <div className="w-64 h-64 relative mx-auto">
              <Image
                src={qrData.qr_code}
                alt="QR Code"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="mt-2">Total: {formatCurrency(amount)}</p>
            <div className="mt-2 text-blue-700 text-sm animate-pulse">
              Waiting for payment...
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Order ID: {qrData.order_id}
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}
