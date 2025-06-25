import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import CheckRequest from '@/models/CheckRequest';
import VehicleTransaction from '@/models/VehicleTransaction';
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const transactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .populate('checkRequestId', 'checkNumber ')
        .populate('createdBy', 'name')
        .populate('requestedBy', 'name')
        .populate('approvedBy', 'name')
        // .populate({ path: 'vehicleMaintenance', populate: { path: 'vehicleId', select: 'plate model' } });
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch transactions.' });
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect();
      const {status, type, reason, requestedBy, requestedAt,  to, amount, suspenceAmount,quantity, recept_reference, vehicleMaintenance, paymentCategory} = req.body;
      console.log(req.body)
     if(!status || !type || !requestedBy || !requestedAt ) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
     }

    
      const transaction = await Transaction.create({
        status,
        type,
        to,
        amount,
        suspenceAmount,
        reason,
        quantity,
        recept_reference,
        requestedBy,
        requestedAt,
        createdBy: requestedBy,
        paymentType: paymentCategory,
        // vehicleMaintenance will be set after VehicleTransaction creation
      })

      if (Array.isArray(vehicleMaintenance) && vehicleMaintenance.length > 0) {
        const vehicleTransactions = await Promise.all(vehicleMaintenance.map(vm =>
          VehicleTransaction.create({
            ...vm,
            transactionId: transaction._id
          })
        ));
        // Store the created VehicleTransaction IDs in the transaction
        transaction.vehicleMaintenance = vehicleTransactions.map(vt => vt._id);
        await transaction.save();
      }

      return res.status(201).json({ success: true, data: "done" });
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
        { new: true } // Returns the updated document instead of the original one
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }
      const transaction = await Transaction.findById(id);
      if(status === 'rejected' && transaction.paymentType === "vehicleMaintenance" && transaction.vehicleMaintenance.length > 0){
      
        await VehicleTransaction.deleteMany({ transactionId: id });
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