import dbConnect from '@/lib/dbConnect';
import CheckRequest from '@/models/CheckRequest';
import CashAccount from '@/models/CashAccount';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Counter from '@/models/Counter';


export default async function handler(req, res) {
    if(req.method === 'POST'){
        const { id } = req.query;
        const { checkNumber, bank, notes, amount, reason, to, type } = req.body;
        console.log(req.body)
        if(!checkNumber || !bank || !amount || !reason || !to || !type){
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        try {
            await dbConnect();
            const newCheckRequest = await CheckRequest.create({
              type,
              status: "prepared",
              checkNumber,
              bank,
              notes,        
            });
            let counterDoc
            if (newCheckRequest && newCheckRequest._id) {
              counterDoc = await Counter.findOne();
              counterDoc.cpv += 1;
              const serialNumber = counterDoc.cpv;
              await counterDoc.save();
             const newTransaction = await Transaction.findByIdAndUpdate(
                id,
                {
                  to,
                  reason,
                  amount,
                  checkSerialNumber: serialNumber,
                  checkRequestId: newCheckRequest._id,
                },
                { new: true }
              );
              console.log(newTransaction)
              return res.status(201).json({ success: true, message: 'Check request prepared and transaction updated.', data: newCheckRequest });
            } else {
              return res.status(500).json({ success: false, message: 'Failed to create check request.' });
            }
            
        } catch (error) {
            console.error('Error preparing check:', error);
            return res.status(500).json({ success: false, message: 'Server error. Could not prepare check.' });
        }
    }else if(req.method === 'PUT'){
        const { id } = req.query;
        
        const transaction = await Transaction.findByIdAndUpdate(id, {
            status: "paid",
        }, { new: true });
        if(transaction.status !== "paid"){
            return res.status(400).json({ success: false, message: 'Transaction is not paid.' });
        }
        if(transaction.type === "check_payment"){
         await CheckRequest.findByIdAndUpdate(transaction.checkRequestId, {
            status: "paid",
        }, { new: true });
        if(transaction.paymentType === "vehicleMaintenance"){
          transaction.vehicleMaintenance.forEach(async (item) => {
            await VehicleMaintenance.findByIdAndUpdate(item._id, {
              status: "completed",
            }, { new: true });
          }); 
        }
      }       
      console.log(transaction)
        return res.status(200).json({ success: true, message: 'Transaction updated.', data: transaction });
        
    }
}