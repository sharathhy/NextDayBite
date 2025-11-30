import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { id } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid Meal ID' });
    }

    try {
      // 1. Check if entry exists and status
      const entry = await prisma.mealEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        return res.status(404).json({ success: false, message: 'Invalid QR Code: Entry not found.' });
      }

      if (entry.isRedeemed) {
        return res.status(400).json({ success: false, message: 'This QR Code has already been used.', entry });
      }

      // 2. Mark as redeemed
      const updatedEntry = await prisma.mealEntry.update({
        where: { id },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
        },
      });

      return res.status(200).json({ success: true, message: 'Meal redeemed successfully!', entry: updatedEntry });

    } catch (error) {
      console.error("Redemption error:", error);
      return res.status(500).json({ success: false, message: 'Internal server error during redemption.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}