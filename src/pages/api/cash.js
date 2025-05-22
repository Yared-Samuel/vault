import dbConnect from '@/lib/dbConnect';
import CashAccount from '@/models/CashAccount';
import Transaction from '@/models/Transaction';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    try {
      const accounts = await CashAccount.find({});
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cash accounts' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { transactionId, cashAccountId, type, relatedReceiptUrl, reason, to , returnAmount, quantity, recept_reference } = req.body;
      console.log(req.body);
      if (!transactionId || !cashAccountId || !type ||  !recept_reference) {
        return res.status(400).json({ error: `Missing required fields: ${!type ? 'type' : ''}${!recept_reference ? 'recept_reference' : ''}` });
      }
      const transaction = await Transaction.findById(transactionId);
      const cashAccount = await CashAccount.findById(cashAccountId);
      if (!transaction || !cashAccount) {
        return res.status(404).json({ error: 'Transaction or Cash Account not found' });
      }
      let amountToDeduct = 0;
      let newStatus = '';
      if (type === 'receipt_payment') {
        amountToDeduct = transaction.amount;
        newStatus = 'paid';
        if (typeof reason === 'string') transaction.reason = reason;
        if (typeof to === 'string') transaction.to = to;
        if (typeof recept_reference === 'string') transaction.recept_reference = recept_reference;
        if (typeof relatedReceiptUrl === 'string' && relatedReceiptUrl) transaction.relatedReceiptUrl = relatedReceiptUrl;
      } else if (type === 'suspence_payment') {
        const suspenceAmount = transaction.suspenceAmount || 0;
        const retAmount = typeof returnAmount === 'number' ? returnAmount : Number(returnAmount) || 0;
        amountToDeduct = suspenceAmount - retAmount;
        newStatus = 'suspence';
        if (typeof returnAmount !== 'undefined') transaction.returnAmount = retAmount;
        if (typeof reason === 'string') transaction.reason = reason;
        if (typeof to === 'string') transaction.to = to;
        if (typeof relatedReceiptUrl === 'string' && relatedReceiptUrl) transaction.relatedReceiptUrl = relatedReceiptUrl;
        transaction.amount = amountToDeduct;
      } else {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }
      if (typeof amountToDeduct !== 'number' || amountToDeduct <= 0) {
        return res.status(400).json({ error: 'Invalid amount to deduct' });
      }
      if (cashAccount.balance < amountToDeduct) {
        return res.status(400).json({ error: 'Insufficient balance in cash account' });
      }
      cashAccount.balance -= amountToDeduct;
      transaction.status = newStatus;
      transaction.cashAccount = cashAccount._id;
      await cashAccount.save();
      await transaction.save();
      res.status(200).json({ success: true, cashAccount, transaction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process payment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 