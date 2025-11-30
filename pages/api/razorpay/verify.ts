import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { MealEntry } from '../../../types';

// Simple UUID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      entries,
      amount,
      redeemPoints
    } = req.body;

    try {
      // 1. Verify Signature
      const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
      }

      // 2. Prepare Data
      const employeeId = entries[0].employeeId;
      const pointsToRedeem = redeemPoints || 0;

      // Filter duplicates logic (same as standard API)
      const dates = entries.map((e: any) => e.date);
      const existingEntries = await prisma.mealEntry.findMany({
        where: {
          employeeId: employeeId,
          date: { in: dates }
        },
        select: { date: true }
      });
      const existingDates = new Set(existingEntries.map(e => e.date));
      const newEntries = entries.filter((e: any) => !existingDates.has(e.date));

      if (newEntries.length === 0) {
        return res.status(200).json({ message: "Payment verified, but all selected dates were already booked." });
      }

      // 3. Database Transaction: Record Payment + Book Meals + Deduct Points
      const result = await prisma.$transaction(async (tx) => {
        // Record Payment
        await tx.payment.create({
          data: {
            date: new Date().toISOString().split('T')[0],
            employeeId: employeeId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount: amount * 100, // Store in paise
            currency: 'INR'
          }
        });

        // Deduct points if any
        if (pointsToRedeem > 0) {
           await tx.userPoint.update({
            where: { employeeId },
            data: { points: { decrement: pointsToRedeem } }
          });

           await (tx as any).pointHistory.create({
            data: {
              employeeId,
              change: -pointsToRedeem,
              reason: `Redemption (with Payment) for booking ${pointsToRedeem} meal(s)`
            }
          });
        }

        // Create Meal Entries
        const entriesToCreate = newEntries.map((entry: any, index: number) => ({
            ...entry,
            id: generateId(),
            mealType: entry.mealType === 'Veg' ? 'Veg' : 'Non_Veg', 
            paymentMethod: 'Online' // Mark as paid via Razorpay
        }));

        return await tx.mealEntry.createMany({
          data: entriesToCreate,
        });
      });

      res.status(200).json({ success: true, message: "Payment successful and meals booked!", data: result });

    } catch (error) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ message: "Internal Server Error during verification" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}