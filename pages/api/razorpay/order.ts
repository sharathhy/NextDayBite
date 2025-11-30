import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { amount, currency } = req.body;

    if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
    }

    try {
      // NOTE: process.env.RAZORPAY_KEY_ID and process.env.RAZORPAY_KEY_SECRET must be set in .env
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Fallback for demo
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
      });

      const options = {
        amount: amount * 100, // Amount in paise
        currency: currency || "INR",
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await instance.orders.create(options);

      // Return the order details along with the key_id so the frontend can use it
      res.status(200).json({
          ...order,
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
      });
    } catch (error) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ message: 'Something went wrong while creating order' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}