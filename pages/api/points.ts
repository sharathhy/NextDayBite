import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { employeeId } = req.query;

    if (!employeeId || typeof employeeId !== 'string') {
      return res.status(400).json({ message: 'Missing employeeId' });
    }

    try {
      const userPoint = await prisma.userPoint.aggregate({
  where: { employeeId },
  _sum: { points: true },
      });

      res.status(200).json({ points: userPoint._sum.points ?? 0 });
    } catch (error) {
      console.error("Failed to fetch points:", error);
      res.status(500).json({ message: 'Failed to fetch points' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


