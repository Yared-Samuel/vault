import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import CashAccount from "@/models/CashAccount";

export default async function handler(req, res) {
  if (req.method === "PATCH") {
    const { transactionId, cashAccountId, amount, reason } = req.body;
    console.log(req.body);
    console.log("Suspance payment")
    try {
      await dbConnect();
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      if (transaction.type !== "suspence_payment" || transaction.status !== "approved") {
        return res.status(400).json({ success: false, message: "Transaction is not a suspence payment or not approved" });
      }

      let update = {
        suspenceAmount: amount,
        suspenceReason: reason,
        cashAccountId: cashAccountId,
        status: "suspence"
      }

      console.log(update)

      const cashAccount = await CashAccount.findById(cashAccountId);
      console.log(cashAccount)
      // if (!cashAccount || cashAccount.balance < amount) {
      //   return res.status(404).json({ success: false, message: "Cash account not found or balance is not enough" });
      // }

      cashAccount.balance -= amount;
      await cashAccount.save();
      const updated = await Transaction.findByIdAndUpdate(transactionId, update, { new: true });
      if (!updated) {
        // Reverse the cash account balance change
        cashAccount.balance += amount;
        await cashAccount.save();
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      

      return res.status(200).json({ success: true, message: "Transaction updated successfully", data: updated });
      
      
      console.log("Transaction updated successfully")
      
    } catch (error) {
      console.error("Error updating transaction:", error);
      return res.status(500).json({ success: false, message: "Server error. Could not update transaction." });
    }
  }
}
