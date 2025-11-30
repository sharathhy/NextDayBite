import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { category, rating, message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
      // Cast prisma to any to avoid type errors if the client hasn't been regenerated yet
      const feedback = await (prisma as any).feedback.create({
        data: {
          category,
          rating: rating ? parseInt(rating) : null,
          message,
        },
      });

      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      console.error("Feedback submission error:", error);
      res.status(500).json({ message: 'Failed to submit feedback' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}