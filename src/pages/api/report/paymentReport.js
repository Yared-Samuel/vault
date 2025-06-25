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

        const { paymentType, status, type, startDate, endDate, serialNumber } = req.query;

        const query = {};

        if (paymentType) {
            query.paymentType = paymentType;
        }

        if (serialNumber) {
            query.serialNumber = { $gte: Number(serialNumber) };
        }

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (startDate && endDate) {
            query.updatedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            query.updatedAt = {
                $gte: new Date(startDate),
            };
        } else if (endDate) {
            query.updatedAt = {
                $lte: new Date(endDate),
            };
        }

        const transactions = await Transaction.find(query)
            .sort({ updatedAt: -1 })
            .populate('checkRequestId', 'checkNumber')
            .populate('createdBy', 'name')
            .populate('requestedBy', 'name')
            .populate('approvedBy', 'name');

        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ success: false, message: 'Server error. Could not generate report.' });
    }
}