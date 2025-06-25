import dbConnect from '@/lib/dbConnect';
import CashAccount from '@/models/CashAccount';
import Transaction from '@/models/Transaction';
import Counter from '@/models/Counter';

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
      const { transactionId, cashAccountId, type,  reason, to , returnAmount, quantity, recept_reference, vehicleMaintenance } = req.body;
      if (!transactionId || !cashAccountId || !type ||  !recept_reference) {
        return res.status(400).json({ error: `Missing required fields: ${!type ? 'type' : ''}${!recept_reference ? 'recept_reference' : ''}` });
      }
      const transaction = await Transaction.findById(transactionId);
      const cashAccount = await CashAccount.findById(cashAccountId);
      if (!transaction || !cashAccount) {
        return res.status(404).json({ error: 'Transaction or Cash Account not found' });
      }
      let amountToDeduct = 0;
      let amountUsed = 0;
      let newStatus = '';
      if (type === 'receipt_payment') {
        amountToDeduct = transaction.amount;
        newStatus = 'paid';
        if (typeof reason === 'string') transaction.reason = reason;
        if (typeof to === 'string') transaction.to = to;
        if (typeof recept_reference === 'string') transaction.recept_reference = recept_reference;
        // if (typeof vehicleMaintenance === 'object') transaction.vehicleMaintenance = vehicleMaintenance;
      } else if (type === 'suspence_payment') {
        const suspenceAmount = transaction.suspenceAmount || 0;
        newStatus = 'paid';

        amountUsed = suspenceAmount - returnAmount;
        
        
        if (typeof reason === 'string') transaction.reason = reason;
        if (typeof to === 'string') transaction.to = to;
        transaction.amount = amountToDeduct;
        // if (typeof vehicleMaintenance === 'object') transaction.vehicleMaintenance = vehicleMaintenance;
        if (typeof recept_reference === 'string') transaction.recept_reference = recept_reference;
      } else {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }
      if (typeof amountToDeduct !== 'number' || amountToDeduct <= 0 && type === 'receipt_payment') {
        return res.status(400).json({ error: 'Invalid amount to deduct' });
      }
      // if (cashAccount.balance < amountToDeduct && type === 'receipt_payment') {
      //   return res.status(400).json({ error: 'Insufficient balance in cash account' });
        
      // }
      type === 'receipt_payment' ? cashAccount.balance -= amountToDeduct : cashAccount.balance += Number(returnAmount);
      type === 'suspence_payment' ? transaction.amount = Number(amountUsed) : transaction.amount = Number(amountToDeduct);
      transaction.status = newStatus;
      transaction.cashAccount = cashAccount._id;
      
      console.log("one");
      if (!transaction.serialNumber) {
        let counterDoc = await Counter.findOne();
        if (!counterDoc) {
          counterDoc = await Counter.create({ cpv: 0, pcpv: 0 });
        }
        let serialNumber;
        if (type === 'check_payment') {
          counterDoc.cpv += 1;
          serialNumber = counterDoc.cpv;
        } else {
          counterDoc.pcpv += 1;
          serialNumber = counterDoc.pcpv;
        }
        await counterDoc.save();
        transaction.serialNumber = serialNumber;
      }
      console.log(transaction);
      await cashAccount.save();
      await transaction.save();
      console.log("two");
      res.status(200).json({ success: true, cashAccount, transaction });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 



