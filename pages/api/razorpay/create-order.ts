// pages/api/razorpay/create-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID!;
const key_secret = process.env.RAZORPAY_KEY_SECRET!;

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Amount must be ≥ 100 paise (₹1)" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: true,
    });

    return res.status(200).json({
      success: true,
      order,       // 🔥 important
      key: key_id, // 🔥 send key to frontend
    });

  } catch (err: any) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
}
