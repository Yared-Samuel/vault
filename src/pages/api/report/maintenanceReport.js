import dbConnect from "@/lib/dbConnect";
import VehicleTransaction from "@/models/VehicleTransaction";
import Vehicle from "@/models/Vehicle";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        await dbConnect();

        const { vehicleId, action, vehicleComponentCategory,vehicleComponents ,startDate, endDate } = req.query;

        const query = {};

        if (vehicleId) {
            query.vehicleId = vehicleId;
        }

        if (action) {
            query.action = action;
        }

        if (vehicleComponentCategory) {
            query.vehicleComponentCategory = vehicleComponentCategory;
        }

        if (vehicleComponents) {
            query.vehicleComponents = vehicleComponents;
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

        const transactions = await VehicleTransaction.find(query)
            .sort({ createdAt: -1 })
                .populate('vehicleId', 'plate')
                
        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ success: false, message: 'Server error. Could not generate report.' });
    }
}