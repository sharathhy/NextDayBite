import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.mealEntry.delete({
        where: { id: id },
      });
      res.status(204).end(); // No Content
    } catch (error) {
      console.error(`Failed to delete entry with id ${id}:`, error);
      // P2025: Record to delete does not exist.
      if (error instanceof Error && (error as any).code === 'P2025') {
        return res.status(404).json({ message: `Meal entry not found` });
      }
      res.status(500).json({ message: `Failed to delete meal entry` });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
