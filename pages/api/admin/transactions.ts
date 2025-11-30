
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Cast prisma to any to access model if types aren't regenerated
      const payments = await (prisma as any).payment.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(payments);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
