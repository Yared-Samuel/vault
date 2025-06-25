import dbConnect from "@/lib/dbConnect";
import VehicleTransaction from "@/models/VehicleTransaction";

export default async function handler(req, res) {
    await dbConnect();

    const {method, query, body} = req;

    if(method === 'GET') {
        try {
           
            const data = await VehicleTransaction.find()            
            .sort({ createdAt: -1})
            .populate('vehicleId', 'plate model')
            
            return res.status(200).json({success: true, data});
        } catch (err) {
            return res.status(500).json({error: err.message});
        }
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
}