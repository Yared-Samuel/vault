import dbConnect from '@/lib/dbConnect';
import Vehicle from '@/models/Vehicle';

export default async function handler(req, res) {
  await dbConnect();

  const { method, query, body } = req;

  // GET /api/vehicles or /api/vehicles?id=...
  if (method === 'GET') {
    try {
      if (query.id) {
        const data = await Vehicle.findById(query.id);
        if (!data) return res.status(404).json({ error: 'Vehicle not found' });
        return res.status(200).json({success: true, data});
      } else {
        const data = await Vehicle.find();
        return res.status(200).json({success: true, data});
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/vehicles
  if (method === 'POST') {
    try {
      const { plate, model, fuelType } = body;
      if (!plate || !fuelType) {
        return res.status(400).json({ error: 'Plate and fuelType are required' });
      }
      const vehicle = await Vehicle.create({ plate, model, fuelType });
      return res.status(201).json(vehicle);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 