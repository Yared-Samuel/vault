import dbConnect from '@/lib/dbConnect';
import FuelTransaction from '@/models/FuelTransaction';
import { ObjectId } from 'mongodb';
import Vehicle from '@/models/Vehicle';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;
  console.log("Getting from here")
  if (method === 'GET') {
    try {
      await dbConnect();
      // Find the latest transaction for the given vehicleId
      const transaction = await FuelTransaction.findOne({ vehicleId: new ObjectId(id) })
        .sort({ pumpedAt: -1, createdAt: -1 })
        .populate('vehicleId', 'plate category fuelType')
        .populate('recordedBy', 'name');
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'FuelTransaction not found' });
      }
      return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error fetching fuel transaction by vehicleId:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch fuel transaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
} 