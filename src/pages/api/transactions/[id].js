import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import CheckRequest from '@/models/CheckRequest';
import VehicleTransaction from '@/models/VehicleTransaction';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import Counter from '@/models/Counter';
export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  console.log(id)
  console.log("here")
  if (req.method === 'GET') {
    try {
      const transaction = await Transaction.findById(id)
        .populate('checkRequestId', 'checkNumber type status bank paidAt notes')
        .populate('createdBy', 'name ')
        .populate('requestedBy', 'name')
        .populate('approvedBy', 'name')
        .populate('rejectedBy', 'name' )
        .populate('cashAccount', 'name')
        .populate({ path: 'vehicleMaintenance', populate: { path: 'vehicleId', select: 'plate model' } });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }
      return res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 