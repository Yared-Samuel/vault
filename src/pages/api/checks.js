import dbConnect from '@/lib/dbConnect';
import CheckRequest from '@/models/CheckRequest';
import CashAccount from '@/models/CashAccount';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getDataFromToken } from '@/lib/getDataFromToken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { requestedBy, type, amount, checkNumber, bank, notes, dedicatedFuelAccount, to, reason, issuedAt,  transaction } = req.body;
    

    
    // Basic validation
    if (!requestedBy || !type || !amount ||  !checkNumber || !bank || !to || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    if(type === 'purchase' && !transaction) {
      return res.status(400).json({ success: false, message: 'Missing Transaction record for check.' });
    }

    try {
      await dbConnect();
      const newCheckRequest = await CheckRequest.create({
        requestedBy,
        type,
        amount,
        issuedAt,
        checkNumber,
        bank,
        notes,
        dedicatedFuelAccount,
        to,
        reason,
        // status, approvedBy, paidAt are omitted for initial creation
      });
      console.log(newCheckRequest._id)
      // If a transactionId is provided, update the transaction's checkRequestId
      if (transaction) {
        const updatedTx = await Transaction.findByIdAndUpdate(transaction, { checkRequestId: newCheckRequest._id });
        console.log('updatedTx', updatedTx);

        if (!updatedTx) {
          // Rollback: delete the created check request
          await CheckRequest.findByIdAndDelete(newCheckRequest._id);
          return res.status(500).json({ success: false, message: 'Failed to update transaction with checkRequestId. Check request rolled back.' });
        }
      }
      return res.status(201).json({ success: true, message: 'Check request created successfully.', data: newCheckRequest });
    } catch (error) {
      console.error('Error creating check request:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not create check request.' });
    }
  }

  if (req.method === 'GET') {
    
    try {
      await dbConnect();
      const checkRequests = await CheckRequest.find().populate('requestedBy', 'name email').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: checkRequests });
    } catch (error) {
      console.error('Error fetching check requests:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch check requests.' });
    }
  }

  if (req.method === 'PATCH') {
    const { id, status, type } = req.body;
    // Only get user if needed
    let user = null;
    if (status === 'paid') {
      user = await getDataFromToken(req.cookies.token);
    }
    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Missing id or status.' });
    }
    const allowedStatuses = ['pending', 'approved', 'paid', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    try {
      await dbConnect();
      // If status is approved, rejected, or pending, just update status and return
      if (['approved', 'rejected', 'pending'].includes(status)) {
        const updated = await CheckRequest.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) {
          return res.status(404).json({ success: false, message: 'Check not found.' });
        }
        return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
      }
      // If status is paid, run all related operations in a transaction
      if (status === 'paid') {
        const checkRequest = await CheckRequest.findById(id);
        if (!checkRequest) {
          return res.status(404).json({ success: false, message: 'Check not found.' });
        }
        // If type is purchase or general, update the existing transaction and checkRequest
        if (checkRequest.type === 'purchase' || checkRequest.type === 'general') {
          // There is always a transaction for these types
          console.log('checkRequest', checkRequest._id);
          const transaction = await Transaction.findOne({ checkRequestId: checkRequest._id });
          if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found for this check request.' });
          }
          // Update the transaction status and any other relevant fields
          transaction.status = 'paid';
          transaction.recept_reference = checkRequest.recept_reference;
          transaction.relatedReceiptUrl = checkRequest.relatedReceiptUrl;
          await transaction.save();

          // Update the check request status
          const updated = await CheckRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
          );
          if (!updated) {
            return res.status(500).json({ success: false, message: 'Failed to update check status.' });
          }
          return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
        }
        // If type is petty_cash or fuel, update/create the corresponding CashAccount, then update checkRequest
        if (checkRequest.type === 'petty_cash') {
          const petty = await CashAccount.findOneAndUpdate(
            { name: 'Petty Cash' },
            { $inc: { balance: checkRequest.amount } },
            { new: true } // Returns the updated document instead of the original
          );
          if (!petty) {
            await CashAccount.create({ name: 'Petty Cash', balance: checkRequest.amount });
          }
          const updated = await CheckRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
          );
          if (!updated) {
            return res.status(500).json({ success: false, message: 'Failed to update check status.' });
          }
          return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
        }
        if (checkRequest.type === 'fuel') {
          const fuel = await CashAccount.findOneAndUpdate(
            { name: 'Fuel Cash' },
            { $inc: { balance: checkRequest.amount } },
            { new: true }
          );
          if (!fuel) {
            await CashAccount.create({ name: 'Fuel Cash', balance: checkRequest.amount });
          }
          const updated = await CheckRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
          );
          if (!updated) {
            return res.status(500).json({ success: false, message: 'Failed to update check status.' });
          }
          return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
        }
        // fallback for other types
        const updated = await CheckRequest.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );
        if (!updated) {
          return res.status(404).json({ success: false, message: 'Check not found.' });
        }
        return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
      }
      // fallback (should not reach here)
      return res.status(500).json({ success: false, message: 'Unknown error.' });
    } catch (error) {
      console.error('Error updating check status:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not update status.' });
    }
  }

  // Handle other methods or return 405
  res.setHeader('Allow', ['POST', 'GET', 'PATCH']);
  res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
} 