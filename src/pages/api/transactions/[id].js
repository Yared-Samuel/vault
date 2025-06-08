import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const transaction = await Transaction.findById(id)
        .populate('checkRequestId', 'checkNumber')
        .populate('createdBy', 'name')
        .populate('requestedBy', 'name')
        .populate('approvedBy', 'name')
        .populate('rejectedBy', 'name')
        .populate('cashAccount', 'name')
        .populate('vehicleMaintenance.vehicleId', 'plate model');
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }
      return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch transaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 