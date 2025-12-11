import type { NextApiRequest, NextApiResponse } from 'next';
import { MealType, PrismaClient } from '@prisma/client';
import { useCurrentTime } from '@/hooks/useCurrentTime';
const prisma = new PrismaClient();

const VEG_PRICE_PAISE = 45;
const NONVEG_PRICE_PAISE = 70;

function calculateMealPrice(mealType: MealType) {
  return mealType === MealType.Non_Veg ? NONVEG_PRICE_PAISE : VEG_PRICE_PAISE;
}

// Helper to get current IST timestamp
const getISTDate = (): Date => {
  const nowUTC = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes
  return new Date(nowUTC.getTime() + istOffset);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const entryId = Array.isArray(id) ? id[0].trim() : (typeof id === 'string' ? id.trim() : '');

  if (!entryId) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'PUT') {
  try {
    console.log(`[API] Attempting to cancel entry: ${entryId}`);

    const entry = await prisma.mealEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return res.status(200).json({ message: 'Entry already cancelled or not found.', id: entryId });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealDate = new Date(entry.date);
    mealDate.setHours(0, 0, 0, 0);

    if (mealDate < today) {
      return res.status(403).json({
        success: false,
        reason: 'You cannot cancel past meals.',
      });
    }

    await prisma.$transaction([
      prisma.mealEntry.update({
        where: { id: entryId },
        data: { isCancelled: true,updatedAt: getISTDate() },
      }),
      prisma.userPoint.upsert({
        where: { employeeId: entry.employeeId },
        update: { points: { increment: calculateMealPrice(entry.mealType) } },
        create: {
          employeeId: entry.employeeId,
          points: calculateMealPrice(entry.mealType),
          mealType: entry.mealType,
        },
      }),
      (prisma as any).pointHistory.create({
        data: {
          employeeId: entry.employeeId,
          change: calculateMealPrice(entry.mealType),
          createdAt: getISTDate(),
          reason: `Cancellation of meal entry ${entryId} for date ${entry.date}`,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Meal cancelled successfully. Reward Points added.',
      id: entryId,
    });

  } catch (error) {
    console.error(`[API] Failed to cancel entry:`, error);
    res.status(500).json({ message: `Failed to cancel meal entry: ${(error as Error).message}` });
  }
} else {
  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

}
