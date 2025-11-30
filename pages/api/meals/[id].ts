// import type { NextApiRequest, NextApiResponse } from 'next';
// // import prisma from '../../../lib/prisma';
// import { MealType, PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();


//       const VEG_PRICE_PAISE = 45;     // ₹50
//       const NONVEG_PRICE_PAISE = 70;  // ₹70

//    function calculateMealPrice(mealType: MealType) {
//         return mealType === MealType.Non_Veg ? NONVEG_PRICE_PAISE : VEG_PRICE_PAISE;
//       }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { id } = req.query;

//   // Handle potential array or undefined query param, and trim whitespace
//   const entryId = Array.isArray(id) ? id[0].trim() : (typeof id === 'string' ? id.trim() : '');

//   if (!entryId) {
//     return res.status(400).json({ message: 'Invalid ID' });
//   }

//   if (req.method === 'DELETE') {
//     try {
//       console.log(`[API] Attempting to cancel entry: ${entryId}`);
      
//       // 1. Try to find the entry first to get employeeId for points
//       const entry = await prisma.mealEntry.findUnique({
//         where: { id: entryId },
//       });

//       if (!entry) {
//         // Idempotent success: If it's already gone, tell client it's success so they remove it from UI
//         console.log(`[API] Entry ${entryId} not found, assuming already deleted.`);
//         return res.status(200).json({ message: 'Entry already cancelled or not found.', id: entryId });
//       }


   

//       // 2. Perform Transaction: Delete entry and increment points
//       await prisma.$transaction([
//         prisma.mealEntry.delete({
//           where: { id: entryId },
//         }),
//         prisma.userPoint.upsert({
//           where: { employeeId: entry.employeeId },
//           update: { points: { increment: calculateMealPrice(entry.mealType) } },
//           create: { employeeId: entry.employeeId, points: calculateMealPrice(entry.mealType),mealType: entry.mealType },
//         }),
//          (prisma as any).pointHistory.create({
//           data: {
//             employeeId: entry.employeeId,
//             change: calculateMealPrice(entry.mealType),
//             reason: `Cancellation of meal entry ${entryId} for date ${entry.date}`
//           }
//         }),
//       ]);
      
//       console.log(`[API] Entry ${entryId} cancelled successfully.`);
//       res.status(200).json({ message: 'Meal cancelled successfully. Reward Points added.', id: entryId });
//     } catch (error) {
//       console.error(`[API] Failed to delete entry with id ${entryId}:`, error);
      
//       // Check for Prisma "Record not found" error code (P2025) explicitly
//       if ((error as any).code === 'P2025') {
//          return res.status(200).json({ message: 'Entry already processed.', id: entryId });
//       }

//       res.status(500).json({ message: `Failed to delete meal entry: ${(error as Error).message}` });
//     }
//   } else {
//     res.setHeader('Allow', ['DELETE']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }


import type { NextApiRequest, NextApiResponse } from 'next';
import { MealType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VEG_PRICE_PAISE = 45;
const NONVEG_PRICE_PAISE = 70;

function calculateMealPrice(mealType: MealType) {
  return mealType === MealType.Non_Veg ? NONVEG_PRICE_PAISE : VEG_PRICE_PAISE;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const entryId = Array.isArray(id) ? id[0].trim() : (typeof id === 'string' ? id.trim() : '');

  if (!entryId) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'DELETE') {
    try {
      console.log(`[API] Attempting to cancel entry: ${entryId}`);

      const entry = await prisma.mealEntry.findUnique({
        where: { id: entryId },
      });

      if (!entry) {
        console.log(`[API] Entry ${entryId} not found, assuming already deleted.`);
        return res.status(200).json({ message: 'Entry already cancelled or not found.', id: entryId });
      }

      // 🔒 DATE VALIDATION — prevent system date manipulation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealDate = new Date(entry.date);
      mealDate.setHours(0, 0, 0, 0);

      // ❌ Block cancellation if date is past
      if (mealDate < today) {
        return res.status(403).json({
          success: false,
          reason: 'You cannot cancel past meals.',
        });
      }

      // // ⏰ OPTIONAL: Same-day cutoff time (e.g., 9 AM)
      // const cutoffHour = 9;
      // const now = new Date();
      // if (mealDate.getTime() === today.getTime() && now.getHours() >= cutoffHour) {
      //   return res.status(403).json({
      //     success: false,
      //     reason: `Same-day cancellations are only allowed before ${cutoffHour}:00 AM.`,
      //   });
      // }

      // TRANSACTION — delete entry and apply reward points
      await prisma.$transaction([
        prisma.mealEntry.delete({ where: { id: entryId } }),
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
            reason: `Cancellation of meal entry ${entryId} for date ${entry.date}`,
          },
        }),
      ]);

      console.log(`[API] Entry ${entryId} cancelled successfully.`);
      return res.status(200).json({
        success: true,
        message: 'Meal cancelled successfully. Reward Points added.',
        id: entryId,
      });

    } catch (error) {
      console.error(`[API] Failed to delete entry with id ${entryId}:`, error);

      if ((error as any).code === 'P2025') {
        return res.status(200).json({ message: 'Entry already processed.', id: entryId });
      }

      res.status(500).json({ message: `Failed to delete meal entry: ${(error as Error).message}` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
