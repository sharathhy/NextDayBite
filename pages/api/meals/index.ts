import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { MealEntry } from '../../../types';

// Simple UUID generator to avoid 'crypto' module dependency issues in some environments
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
  // Prevent caching of the meal list to ensure deleted items disappear immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      let entriesData: Omit<MealEntry, 'id'>[] = [];
      let redeemPointsRequest = 0;

      // Check if body is array (legacy) or object (new)
      if (Array.isArray(body)) {
        entriesData = body;
      } else {
        entriesData = body.entries;
        redeemPointsRequest = body.redeemPoints || 0;
      }

      if (!entriesData || entriesData.length === 0) {
        return res.status(400).json({ message: 'No entries provided' });
      }
      
      const employeeId = entriesData[0].employeeId;

      // Filter out duplicates manually to calculate correct points usage
      const dates = entriesData.map(e => e.date);
      const existingEntries = await prisma.mealEntry.findMany({
        where: {
          employeeId: employeeId,
          date: { in: dates }
        },
        select: { date: true }
      });

      const existingDates = new Set(existingEntries.map(e => e.date));
      const newEntries = entriesData.filter(e => !existingDates.has(e.date));

      if (newEntries.length === 0) {
        return res.status(200).json({ count: 0 });
      }

      let pointsToRedeem = 0;
      if (redeemPointsRequest > 0) {
        const userPoints = await prisma.userPoint.findUnique({
          where: { employeeId }
        });
        const currentPoints = userPoints?.points || 0;
        
        if (currentPoints < redeemPointsRequest) {
             return res.status(400).json({ message: `Insufficient points. You have ${currentPoints} but tried to redeem ${redeemPointsRequest}.` });
        }
        
        pointsToRedeem = redeemPointsRequest;
      }

      // Prepare data with IDs and payment method
      const entriesToCreate = newEntries.map((entry, index) => ({
        ...entry,
        id: generateId(), // Ensure every entry has a valid ID using our helper
        mealType: entry.mealType === 'Veg' ? 'Veg' : 'Non_Veg', 
        paymentMethod: index < pointsToRedeem ? 'Points' : 'Standard'
      }));

      // Transaction
      const result = await prisma.$transaction(async (tx) => {
        if (pointsToRedeem > 0) {
          await tx.userPoint.update({
            where: { employeeId },
            data: { points: { decrement: pointsToRedeem } }
          });
      // Cast tx to any to avoid TS error if schema types aren't regenerated
          await (tx as any).pointHistory.create({
            data: {
              employeeId,
              change: -pointsToRedeem,
              reason: `Redemption for booking ${pointsToRedeem} meal(s)`
            }
          });
        }
        
        // Use createMany for bulk insertion
        return await tx.mealEntry.createMany({
          data: entriesToCreate as any,
        });
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Failed to create entries:", error);
      if (error instanceof Error) {
         res.status(500).json({ message: error.message || 'An unexpected error occurred' });
      } else {
         res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}