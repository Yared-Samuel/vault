import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const users = await User.find({}, '_id name email role lastLogin');
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} 