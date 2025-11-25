import type { NextApiRequest, NextApiResponse } from 'next';
import { MealType, Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { MealEntry } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const entries = await prisma.mealEntry.findMany({
        orderBy: [
          { date: 'asc' },
          { employeeName: 'asc' },
        ],
      });
      res.status(200).json(entries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      res.status(500).json({ message: 'Failed to fetch meal entries' });
    }
  } else if (req.method === "POST") {
  try {
    const { entries, payment } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Entries must be a non-empty array." });
    }

    if (!payment) {
      return res.status(400).json({ message: "Payment object is required." });
    }

    // Normalize meal type & sanitize entries
    const normalizedEntries = entries.map((entry: any) => ({
      ...entry,
      mealType:
        entry.mealType?.toLowerCase() === "veg" ? "Veg" : "Non_Veg",
    }));

    // 👉 1️⃣ Save MEAL ENTRIES (bulk insert)
    const mealResult = await prisma.mealEntry.createMany({
      data: normalizedEntries,
      skipDuplicates: true,
    });

    // 👉 2️⃣ Save PAYMENT
    const paymentResult = await prisma.payment.create({
      data: {
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_signature: payment.razorpay_signature,
        amount: payment.amount,
        currency: payment.currency,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Meal entries and payment saved successfully",
      insertedEntries: mealResult.count,
      paymentId: paymentResult.id,
    });

  } catch (error: any) {
    console.error("Error saving meal & payment:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while saving meal entries & payment",
      error: error.message,
    });
  }
}
 else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
