import dbConnect from '@/lib/dbConnect';
import CheckRequest from '@/models/CheckRequest';
import CashAccount from '@/models/CashAccount';
import User from '@/models/User';
import Transaction from '@/models/Transaction';


export default async function handler(req, res) {
    if(req.method === 'POST'){
        const { id } = req.query;
        const { checkNumber, bank, notes, amount, reason, to } = req.body;

        try {
            await dbConnect();
            const newCheckRequest = await CheckRequest.create({
              type,
              status: "prepared",
              checkNumber,
              bank,
              notes,        
            });
            if (newCheckRequest && newCheckRequest._id) {
              await Transaction.findByIdAndUpdate(
                id,
                {
                  to,
                  reason,
                  amount,
                  checkRequestId: newCheckRequest._id,
                },
                { new: true }
              );
              return res.status(201).json({ success: true, message: 'Check request prepared and transaction updated.', data: newCheckRequest });
            } else {
              return res.status(500).json({ success: false, message: 'Failed to create check request.' });
            }
            
        } catch (error) {
            console.error('Error preparing check:', error);
            return res.status(500).json({ success: false, message: 'Server error. Could not prepare check.' });
        }
    }
}