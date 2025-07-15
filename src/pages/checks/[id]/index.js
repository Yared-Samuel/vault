import { banks, checkTypes } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import InputFloating from "@/components/ui/input-floatin";
import SelectInputFloating from "@/components/ui/selectInput-floating";
import { Cross } from "lucide-react";

const PrepareCheck = () => {
  const router = useRouter();
  const { id } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState({
    type: "",
    checkNumber: "",
    bank: "",
    notes: "",
    amount: "",
    reason: "",
    to: "",
  });

  useEffect(() => {
    setLoading(true);
    const getTransaction = async () => {
      const response = await fetch(`/api/transactions/${id}`);
      const data = await response.json();
      console.log(data);
      setTransaction(data.data);
      setLoading(false);
    };
    getTransaction();
  }, [id]);

  useEffect(() => {
    if (transaction) {
      setPayload((prev) => ({
        ...prev,
        
        amount: transaction.amount || "",
        reason: transaction.reason || "",
        to: transaction.to || "",
        bank: transaction?.checkRequestId?.bank || "",
        checkNumber: transaction?.checkRequestId?.checkNumber || "",
        notes: transaction?.checkRequestId?.notes || "",
        type: transaction?.checkRequestId?.type || "",
      }));
    }
  }, [transaction]);

  const handleEntryChange = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const response = await fetch(`/api/checkTransaction/checkPrepare/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast.success("Check prepared successfully");
      window.open(`/checks/invoice/${id}`, "_blank");
    } else {
      toast.error("Failed to prepare check");
    }
    setLoading(false);
    // router.push("/checks");
  };

  return (
    <div className="w-screen bg-white flex flex-col p-4 gap-4">
      <div className="flex justify-between items-center outline-2 p-2 rounded-lg">
        <h2 className="text-lg font-extrabold text-black  text-left tracking-wide drop-shadow">
          Prepare Check Details
        </h2>
        <Button
          className='flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60'
          onClick={handleSubmit}
          disabled={loading}
        >
        <Cross size={20} />  {loading ? "Preparing..." : "Prepare"}
        </Button>
      </div>
      <div className="w-full px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 outline-1 p-4 rounded-lg">
        <SelectInputFloating
          label="Payment Type"
          id="type"
          name="type"
          type=""
          placeholder=" "
          value={payload?.type}
          onChange={handleEntryChange}
          required
          data={checkTypes}
          datakeys="value"
          datavalues="value"
          datalabeling="label"
        />             
        <InputFloating
          type="text"
          name="to"
          id="to"
          value={payload?.to}
          onChange={handleEntryChange}
          required
          label="Paid To"
          placeholder=" "
        />
        <InputFloating
          type="number"
          name="amount"
          id="amount"
          value={payload?.amount}
          onChange={handleEntryChange}
          required
          label="Amount"
          placeholder=" "
        />              
        <InputFloating
          type="text"
          name="reason"
          id="reason"
          value={payload?.reason}
          onChange={handleEntryChange}
          required
          label="Reason"
          placeholder=" "
        />
        <SelectInputFloating
          label="Bank"
          id="bank"
          name="bank"
          type=""
          placeholder=" "
          value={payload?.bank}
          onChange={handleEntryChange}
          required={true}
          data={banks}
          datakeys="value"
          datavalues="value"
          datalabeling="label"
        />
        <InputFloating
          label="Check Number"
          id="checkNumber"
          name="checkNumber"
          type="text"
          placeholder=" "
          value={payload?.checkNumber}
          onChange={handleEntryChange}
          required={true}
        />
        <InputFloating
          label="Notes"
          id="notes"
          name="notes"
          type="textarea"
          placeholder=" "
          value={payload?.notes}
          onChange={handleEntryChange}
          required={false}
        />
      </div>
    </div>
  );
};

export default PrepareCheck;
