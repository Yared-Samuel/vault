import dbConnect from '../../lib/dbConnect'
import Transaction from '@/models/Transaction';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ success: false, message: 'Transaction ID is required' });
  }
  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    tx.type = 'check_payment';
    await tx.save();
    return res.status(200).json({ success: true, message: 'Transaction type updated to check_payment', data: tx });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
