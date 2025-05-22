import dbConnect from '@/lib/dbConnect';
import FuelTransaction from '@/models/FuelTransaction';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();
      const transactions = await FuelTransaction.find()
        .sort({ createdAt: -1 })
        .populate('vehicleId', 'plate  category fuelType')
        .populate('recordedBy', 'name');
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error fetching fuel transactions:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not fetch fuel transactions.' });
    }
  } else if (req.method === 'POST') {
    try {
      await dbConnect();
      const data = req.body;
      //  validate required fields here
      const requiredFields = ['vehicleId', 'pumpedAt', 'liters', 'pricePerLiter', 'totalCost', 'recordedBy'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
        }
      }
      if (typeof data.liters !== 'number' || data.liters <= 0) {
        return res.status(400).json({ success: false, message: 'Liters must be a positive number.' });
      }
      if ( data.odometer && (typeof data.odometer !== 'number' || data.odometer < 0)) {
        return res.status(400).json({ success: false, message: 'Odometer must be a non-negative number.' });
      }
      if (typeof data.pricePerLiter !== 'number' || data.pricePerLiter <= 0) {
        return res.status(400).json({ success: false, message: 'Price per liter must be a positive number.' });
      }
      if (typeof data.totalCost !== 'number' || data.totalCost <= 0) {
        return res.status(400).json({ success: false, message: 'Total cost must be a positive number.' });
      }
      if (isNaN(Date.parse(data.pumpedAt))) {
        return res.status(400).json({ success: false, message: 'Invalid date for pumpedAt.' });
      }
      const transaction = await FuelTransaction.create(data);
      return res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error creating fuel transaction:', error);
      return res.status(500).json({ success: false, message: 'Server error. Could not create fuel transaction.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 