import { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthProvider";
import { checkTypes, banks  } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRedirectLoggedOutUser from "@/lib/redirect";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

export default function NewCheckRequestPage() {
  useRedirectLoggedOutUser();
  const router = useRouter();
  const { auth } = useContext(AuthContext);
  const [form, setForm] = useState({
    type: "purchase",
    amount: "",
    issuedAt: "",
    checkNumber: "",
    bank: "",
    notes: "",
    dedicatedFuelAccount: false,
    dedicatedPettyCashAccount: false,
    to: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [transaction, setTransaction] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    // Show toast for each error when errors state changes
    if (errors && Object.keys(errors).length > 0) {
      Object.values(errors).forEach((errMsg) => {
        if (errMsg) toast.error(errMsg);
      });
    }
  }, [errors]);

  useEffect(()=> {
    const fetchTransactions = async () => { 
      try {
        const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.success) {
        setTransaction(data.data);
      }
      } catch (error) {
        console.error('Failed to fetch transactions', error)  ;
      }
    };
    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (name === 'dedicatedPettyCashAccount') {
      setForm((prev) => {
        const next = {
          ...prev,
          dedicatedPettyCashAccount: value,
          dedicatedFuelAccount: value ? false : prev.dedicatedFuelAccount,
          type: value ? 'petty_cash' : (prev.dedicatedFuelAccount ? 'fuel' : 'purchase'),
        };
        return next;
      });
      return;
    }
    if (name === 'dedicatedFuelAccount') {
      setForm((prev) => {
        const next = {
          ...prev,
          dedicatedFuelAccount: value,
          dedicatedPettyCashAccount: value ? false : prev.dedicatedPettyCashAccount,
          type: value ? 'fuel' : (prev.dedicatedPettyCashAccount ? 'petty_cash' : 'purchase'),
        };
        return next;
      });
      return;
    }
    if (name === 'transaction') {
      setForm((prev) => ({ ...prev, transaction: value }));
      const tx = transaction.find((t) => t._id === value);
      setSelectedTransaction(tx || null);
      if (tx) {
        setForm((prev) => ({
          ...prev,
          amount: tx.amount || '',
          to: tx.to || '',
          reason: tx.reason || '',
          requestedBy: tx.requestedBy?._id || tx.requestedBy || '',
          approvedBy: tx.approvedBy?._id || tx.approvedBy || '',
          requestedAt: tx.createdAt || '',
          approvedAt: tx.approvedAt || '',
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!auth?.id) newErrors.requestedBy = "Requested by (user) is required.";
    if (!form.type) newErrors.type = "Type is required.";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) newErrors.amount = "Amount must be greater than 0.";
    if (!form.checkNumber) newErrors.checkNumber = "Check number is required.";
    if (!form.bank) newErrors.bank = "Bank is required.";
    if (selectedTransaction) {
      if (!form.to) newErrors.to = "To is required.";
      if (!form.reason) newErrors.reason = "Reason is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    // Compose submitData from transaction and form
    let submitData = { ...form };
    if (selectedTransaction) {
      submitData = {
        ...form,
        amount: selectedTransaction.amount,
        // Use the edited form.to and form.reason, not the transaction's
        requestedBy: selectedTransaction.requestedBy?._id || selectedTransaction.requestedBy,
        approvedBy: selectedTransaction.approvedBy?._id || selectedTransaction.approvedBy,
        requestedAt: selectedTransaction.createdAt,
        approvedAt: selectedTransaction.approvedAt,
        transaction: selectedTransaction._id,
      };
    } else {
      // Use the form's values for amount, to, and reason (do not delete them)
      submitData.amount = form.amount !== undefined && form.amount !== null && form.amount !== '' ? Number(form.amount) : '';
      submitData.to = form.to !== undefined && form.to !== null ? String(form.to) : '';
      submitData.reason = form.reason !== undefined && form.reason !== null ? String(form.reason) : '';
      submitData.requestedBy = auth.id;
      // Remove transaction-specific fields if present
      delete submitData.approvedBy;
      delete submitData.requestedAt;
      delete submitData.approvedAt;
      delete submitData.transaction;
    }
    try {
      
      const response = await fetch('/api/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success('Request submitted successfully!');
        setForm({
          type: "",
          amount: "",
          issuedAt: "",
          checkNumber: "",
          bank: "",
          notes: "",
          dedicatedFuelAccount: false,
          dedicatedPettyCashAccount: false,
          to: "",
          reason: "",
        });
        setErrors({});
        // After submitting, navigate to print page with checkRequest id and transaction id (if any)
        const checkRequestId = result.data._id;
        const transactionId = selectedTransaction ? selectedTransaction._id : '';
        router.push(`/checks/print?checkRequestId=${checkRequestId}${transactionId ? `&transactionId=${transactionId}` : ''}`);
      } else {
        toast.error(result.message || 'Failed to submit request.');
      }
    } catch (error) {
      toast.error('An error occurred while submitting the request.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center py-8 px-0">
      <div className="w-full rounded-2xl shadow-2xl border border-gray-200 bg-white/90 p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-blue-200/60 hover:scale-[1.01]">
        <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight text-gray-800 font-sans drop-shadow-sm">New Check Request</h1>
        <div className="mb-4 flex justify-start">
          <Button type="button" variant="outline" onClick={() => router.push('/checks')} className="flex items-center gap-2">
            <ArrowLeft size={20} />
            Go Back
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requested By (hidden, set from auth) */}
          <input type="hidden" name="requestedBy" value={auth?.id || ""} />
          {/* Dedicated Account Switches Side by Side */}
          <div className="flex flex-row gap-4 mb-4">
            {/* Dedicated Fuel Account */}
            <div
              className={`flex-1 flex flex-row items-center justify-between rounded-lg border p-4 transition-all duration-200 cursor-pointer ${form.dedicatedFuelAccount ? 'bg-blue-50 border-blue-400 shadow-lg scale-105' : 'bg-white border-gray-200'}`}
              title="Use this for checks dedicated to fuel expenses."
              onClick={() => handleSelectChange('dedicatedFuelAccount', !form.dedicatedFuelAccount)}
            >
              <div className="space-y-0.5 flex items-center gap-2">
                <span className="text-2xl">⛽</span>
                <label className="font-medium">Dedicated Fuel Account</label>
                {form.dedicatedFuelAccount && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">Selected</span>
                )}
              </div>
              <Switch
                checked={form.dedicatedFuelAccount}
                onCheckedChange={(val) => handleSelectChange("dedicatedFuelAccount", val)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            {/* Dedicated Petty Cash Account */}
            <div
              className={`flex-1 flex flex-row items-center justify-between rounded-lg border p-4 transition-all duration-200 cursor-pointer ${form.dedicatedPettyCashAccount ? 'bg-green-50 border-green-400 shadow-lg scale-105' : 'bg-white border-gray-200'}`}
              title="Use this for checks dedicated to petty cash."
              onClick={() => handleSelectChange('dedicatedPettyCashAccount', !form.dedicatedPettyCashAccount)}
            >
              <div className="space-y-0.5 flex items-center gap-2">
                <span className="text-2xl">💵</span>
                <label className="font-medium">Dedicated Petty Cash Account</label>
                {form.dedicatedPettyCashAccount && (
                  <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs">Selected</span>
                )}
              </div>
              <Switch
                checked={form.dedicatedPettyCashAccount}
                onCheckedChange={(val) => handleSelectChange("dedicatedPettyCashAccount", val)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          {/* Show selected type badge below switches */}
          {(form.dedicatedFuelAccount || form.dedicatedPettyCashAccount) && (
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${form.dedicatedFuelAccount ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {form.dedicatedFuelAccount ? 'Type: Fuel' : 'Type: Petty Cash'}
              </span>
            </div>
          )}
          {/* Transaction */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Transaction</label>
            <Select
              value={form.transaction}
              onValueChange={(val) => handleSelectChange("transaction", val)}
              disabled={form.dedicatedFuelAccount || form.dedicatedPettyCashAccount}
            >
              <SelectTrigger className="rounded-lg shadow-sm border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 py-2 px-3 font-medium transition disabled:bg-gray-100 disabled:text-gray-400">
                <SelectValue placeholder="Select transaction" />
              </SelectTrigger>
              <SelectContent>
                {transaction
                  .filter((tx) => tx.type === 'check_payment' && tx.status === 'approved' && !tx.checkRequestId)
                  .map((tx) => (
                    <SelectItem key={tx._id} value={tx._id}>
                      {tx.to} - {tx.amount }
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>   
          </div>
          {/* Main fields in a responsive 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-4">
            {/* Type (hidden) */}
            <input type="hidden" name="type" value={form.type} />
            {/* Amount */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                disabled={!!selectedTransaction}
                className={`rounded-lg shadow-sm border ${selectedTransaction ? 'border-gray-300 bg-gray-100 text-gray-400' : 'border-blue-400 bg-white text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'} placeholder-gray-400 py-2 px-3 font-medium transition`}
              />
            </div>
            {/* Issued At */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Issued At</label>
              <Input
                type="date"
                name="issuedAt"
                value={form.issuedAt}
                onChange={handleChange}
                disabled={false}
                className="rounded-lg shadow-sm border border-blue-400 bg-white text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder-gray-400 py-2 px-3 font-medium transition"
              />
            </div>
            {/* Check Number */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Check Number</label>
              <Input
                type="text"
                name="checkNumber"
                value={form.checkNumber}
                onChange={handleChange}
                placeholder="Enter check number"
                disabled={false}
                className="rounded-lg shadow-sm border border-blue-400 bg-white text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder-gray-400 py-2 px-3 font-medium transition"
              />
            </div>
            {/* Bank */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Bank</label>
              <Select value={form.bank} onValueChange={(val) => handleSelectChange("bank", val)} >
                <SelectTrigger className="rounded-lg shadow-sm border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 py-2 px-3 font-medium transition">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* To and Reason fields - always visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <label className="block font-semibold text-gray-700 mb-2">To</label>
              <Input type="text" name="to" value={form.to} onChange={handleChange} className="rounded-lg shadow-sm border border-blue-400 bg-white text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder-gray-400 py-2 px-3 font-medium transition" />
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-700 mb-2">Reason</label>
              <Textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Enter reason" className="rounded-lg shadow-sm border border-blue-400 bg-white text-gray-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder-gray-400 py-2 px-3 font-medium transition min-h-24" />
            </div>
          </div>
          {/* Transaction-locked fields (remove To and Reason from here) */}
          {selectedTransaction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="hidden">
                <label className="block font-semibold text-gray-700 mb-2">Requested By</label>
                <Input type="text" name="requestedBy" value={form.requestedBy} disabled className="rounded-lg shadow-sm border border-gray-200 bg-gray-100 text-gray-400 py-2 px-3 font-medium transition" />
              </div>
              <div className="hidden">
                <label className="block font-semibold text-gray-700 mb-2">Approved By</label>
                <Input type="text" name="approvedBy" value={form.approvedBy} disabled className="rounded-lg shadow-sm border border-gray-200 bg-gray-100 text-gray-400 py-2 px-3 font-medium transition" />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-2">Requested At</label>
                <Input type="text" name="requestedAt" value={form.requestedAt ? new Date(form.requestedAt).toLocaleString() : ''} disabled className="rounded-lg shadow-sm border border-gray-200 bg-gray-100 text-gray-400 py-2 px-3 font-medium transition" />
              </div>
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-2">Approved At</label>
                <Input type="text" name="approvedAt" value={form.approvedAt ? new Date(form.approvedAt).toLocaleDateString() : ''} disabled className="rounded-lg shadow-sm border border-gray-200 bg-gray-100 text-gray-400 py-2 px-3 font-medium transition" />
              </div>
            </div>
          )}
          {/* Notes */}
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Notes / Remarks</label>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)"
              disabled={false}
              className="rounded-lg shadow-sm border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 py-2 px-3 font-medium transition"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full text-lg font-semibold py-3 rounded-xl shadow-md bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 transition-all duration-200">
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
} 