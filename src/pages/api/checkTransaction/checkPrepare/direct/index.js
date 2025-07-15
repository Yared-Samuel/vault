import dbConnect from '@/lib/dbConnect';
import CheckRequest from '@/models/CheckRequest';
import Transaction from '@/models/Transaction';
import Counter from '@/models/Counter';
import User from '@/models/User';

export default async function handler(req, res) {
    if(req.method === 'POST'){
        const { paymentType, status, type, amount, to, reason, requestedBy, quantity,approvedBy, checkType, checkStatus, bank, checkNumber, notes, isCheckIssued, isBankTransfer } = req.body;
        if(!paymentType || !status || !type || !amount || !to || !reason || !requestedBy || !quantity || !approvedBy ){
            return res.status(400).json({ success: false, message: 'Some fields are required(back).' });
        }
        if(isCheckIssued){
        try {
            await dbConnect();
            const checkRequest = await CheckRequest.create({
                type: checkType,
                status: checkStatus,
                checkNumber,
                bank,
                notes,
            })
            let counterDoc
            if (checkRequest && checkRequest._id) {
              counterDoc = await Counter.findOne();
              counterDoc.cpv += 1;
              const serialNumber = counterDoc.cpv;
              const newTransaction = await Transaction.create({
                paymentType,
                status,
                type,
                amount,
                to,
                reason,
                requestedBy,
                quantity,
                approvedBy,
                createdBy: approvedBy,
                // from check request entry
                checkRequestId: checkRequest._id,
                // from counter update
                checkSerialNumber: serialNumber,
              })
              if(!newTransaction || !newTransaction._id){
                await CheckRequest.findByIdAndDelete(checkRequest._id);
                return res.status(400).json({ success: false, message: 'Failed to create transaction.' });
              }
              await counterDoc.save();
              return res.status(201).json({ success: true, message: 'Check request prepared and transaction created.', data: newTransaction._id });
            }

        } catch (error) {
            console.error('Error preparing check:', error);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
      }else if(isBankTransfer){
        try {
          let counterDoc
          counterDoc = await Counter.findOne();
              counterDoc.cpv += 1;
              const serialNumber = counterDoc.cpv;
          console.log(paymentType,status,amount, to ,reason, requestedBy, quantity, approvedBy, bank, serialNumber, isBankTransfer)
          await dbConnect();
          const newTransaferTransaction = await Transaction.create({
            paymentType,
            status: "approved",
            type: "bank_transfer",
            amount,
            to,
            reason,
            requestedBy,
            quantity,
            approvedBy,
            createdBy: requestedBy,
            checkSerialNumber: serialNumber,
            bank,
          })
          if(!newTransaferTransaction || !newTransaferTransaction._id){
            return res.status(400).json({ success: false, message: 'Failed to create transaction.' });
          }
          await counterDoc.save();
          return res.status(201).json({ success: true, message: 'Bank transfer prepared and transaction created.', data: newTransaferTransaction._id });
        }catch(error){
          console.error( error);
          return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
      }else{
        return res.status(400).json({ success: false, message: 'Please select a payment method.' });
      }
            
    }}
