import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import CheckRequest from '@/models/CheckRequest';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const transactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .populate('checkRequestId', 'checkNumber ')
        .populate('createdBy', 'name')
        .populate('requestedBy', 'name')
        .populate('vehicleId', 'plate')
        .populate('approvedBy', 'name')
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch transactions.' });
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect();
      const data = req.body;
      // If using multipart/form-data, parse accordingly (not shown here)
      console.log(data);
      if (Array.isArray(data)) {
        // Handle multiple transactions
        const transactionsToCreate = data.map(item => {
          const transactionData = { ...item };
          if (typeof item.quantity !== 'undefined') transactionData.quantity = Number(item.quantity);
          if (typeof item.serialNumber !== 'undefined') transactionData.serialNumber = item.serialNumber;
          return transactionData;
        });
        const transactions = await Transaction.insertMany(transactionsToCreate);
        return res.status(201).json({ success: true, data: transactions });
      } else {
        // Single transaction (existing logic)
        const transactionData = { ...data };
        if (typeof data.quantity !== 'undefined') transactionData.quantity = Number(data.quantity);
        if (typeof data.serialNumber !== 'undefined') transactionData.serialNumber = data.serialNumber;
        const transaction = await Transaction.create(transactionData);
        return res.status(201).json({ success: true, data: transaction });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not create transaction.' });
    }
  } else if (req.method === 'PATCH') {
    try {
      await dbConnect();
      const { id, approvedBy, status, rejectedBy, rejectedReason } = req.body;
      console.log(req.body);
      let update = {};
      if (status === 'rejected') {
        update = { 
          status: 'rejected', 
          rejectedBy,
          rejectedReason,
          rejectedAt: new Date()
        };
      } else {
        update = { status: 'approved', approvedBy };
      }
      const updated = await Transaction.findByIdAndUpdate(
        id,
        update,
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('Error approving transaction:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not approve transaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}