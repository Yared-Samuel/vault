import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        await dbConnect();

        const { paymentType, status, type, startDate, endDate, serialNumber,bank,isBankTransferAndCheckPayment,isPiticash } = req.query;
        const query = {};
         // for bank transfer and check payment
        if(isBankTransferAndCheckPayment){
            query.type = { $in:['bank_transfer','check_payment']}
        }
         // for piticash
        if(isPiticash){
            query.type = { $in:['receipt_payment','suspence_payment']}
        }

        if (paymentType) {
            query.paymentType = paymentType;
        }

        if (serialNumber) {
            query.serialNumber = { $gte: Number(serialNumber) };
        }

        if (status) {
            query.status = status;
        }

        // if (type) {
        //     query.type = type;
        // }

        if (bank) {
            query.bank = bank;
        }
        if (bank) {
            query.checkRequestId.bank = bank;
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate).setHours(0,0,0,0),
                $lte: new Date(endDate).setHours(23,59,59,999),
            };
        } else if (!startDate && !endDate) {
            query.createdAt = {
                $gte: new Date().setHours(0,0,0,0),
                $lte: new Date().setHours(23,59,59,999),
            };
        } 

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .populate('checkRequestId', 'checkNumber status bank paidAt notes')
            .populate('createdBy', 'name')
            .populate('requestedBy', 'name')
            .populate('approvedBy', 'name');
        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ success: false, message: 'Server error. Could not generate report.' });
    }
}