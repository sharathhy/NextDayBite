// pages/api/razorpay/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const key_secret = process.env.RAZORPAY_KEY_SECRET;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', key_secret || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (err: any) {
    console.error('verify error', err);
    return res.status(500).json({ message: err?.message || 'Server error while verifying payment.' });
  }
}
