import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cross, Eye, Plus, Minus, X, Check, ArrowUpDown } from "lucide-react";
import SelectInputFloating from "@/components/ui/selectInput-floating";
import {
  paymentTypesModel,
  banks,
  checkTypes,
  transactionTypesModel,
  transactionTypesModelValues,
} from "@/lib/constants";
import InputFloating from "@/components/ui/input-floatin";
import { toast } from "sonner";
import CheckBox from "@/components/ui/checkBox";
import { useRouter } from "next/router";
import { DateRangePicker } from "react-date-range";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis,  NotebookPen, Printer, SquareCheck, } from "lucide-react";
import LoadingComponent from "@/components/LoadingComponent";



function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .replace(/\./g, ""); // Remove dot from short month if present
}


const index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [user, setUser] = useState([]);
  const [payload, setPayload] = useState({
    paymentType: "",
    status: "approved",
    type: "check_payment",
    amount: "",
    to: "",
    reason: "",
    requestedBy: "",
    quantity: 1,
    approvedBy: "684a8ca78c888ff8b11cafc0",
    // Check Payment
    isCheckIssued: false,
    checkType: "",
    checkStatus: "prepared",
    bank: "",
    checkNumber: "",
    notes: "",
    // Bank Transfer
    isBankTransfer: false,
  });
  const [params, setParams] = useState({
    paymentType: "",
    type: "",
    bank: "",
    startDate: new Date(),
    endDate: new Date(),
    isBankTransferAndCheckPayment: true,
    
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [data, setData] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const handleEntryChange = (e) => {
    setPayload((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleParamsChange = (e) => {
    setParams((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !payload.paymentType ||
      !payload.amount ||
      !payload.to ||
      !payload.reason ||
      !payload.requestedBy ||
      !payload.quantity ||
      !payload.approvedBy
    ) {
      toast.error("Some fields are required");
      return;
    }
    if (payload.isCheckIssued && !payload.isBankTransfer) {
      setPayload({ ...payload, checkType: "check_payment" });
    } else if (payload.isBankTransfer && !payload.isCheckIssued) {
      setPayload({ ...payload, checkType: "bank_transfer" });
    } else if (payload.isCheckIssued && payload.isBankTransfer) {
      toast.error("Please select only one payment method");
      return;
    } else {
      toast.error("Please select a payment method");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/checkTransaction/checkPrepare/direct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Check prepared successfully");
      // router.push(`/checks/invoice?${data.data._id}`);
    } else {
      toast.error(data.message || "Something went wrong");
    }
    setLoading(false);
  };

  const getUser = async () => {
    setUserLoading(true);
    try {
      const user = await fetch("/api/users/users");
      const data = await user.json();
      setUser(data.data);
      setUserLoading(false);
    } catch (error) {
      setUserLoading(false);
      toast.error("Failed to get users");
    }
  };

  const handleView = async () => {
    setFilterLoading(true);
    try{
    const queryParams = new URLSearchParams(params).toString();
    const responce = await fetch(`/api/report/paymentReport?${queryParams}`);
    const data = await responce.json();
    setData(data.data);
    setShowFilters(false)
    setFilterLoading(false);
    }catch(error){
      toast.error("Failed to get data");
      setFilterLoading(false);
    }
  };

  const handleDateRangeChange = (ranges) => {
    setParams((prev) => ({
      ...prev,
      startDate: ranges.selection.startDate.toISOString(),
      endDate: ranges.selection.endDate.toISOString(),
    }));
    setShowDatePicker(false);
    typeof(params.startDate)
  };
  return (
    <div className="w-screen bg-white flex flex-col p-4 gap-1">
      <h2 className="text-sm font-extrabold text-black   tracking-wide drop-shadow ">
        Direct Check And Bank Transfer Issuance
      </h2>
      <hr className="border-[#D9A404] border-1" />

      <div className="relative">
        <div className="absolute bottom-1 right-2 z-50">
          {!showFilters && (
            <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 cursor-pointer">
              <Plus color="black" size={20}   />
              <p className="text-sm font-extrabold text-black   tracking-wide drop-shadow ">
               View Filters
              </p>
            </button>
          )}
          {showFilters && (
            <button onClick={() => setShowFilters(false)} className="flex items-center gap-2 cursor-pointer">
              <Minus color="black" size={20}   />
              <p className="text-sm font-extrabold text-black   tracking-wide drop-shadow ">
               Hide Filters
              </p>
            </button>
          )}
        </div>
      </div>
      {showFilters && (
        <div className="flex justify-between items-center outline-2 p-2 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <SelectInputFloating
              label="Payment For"
              id="paymentType"
              name="paymentType"
              type=""
              placeholder=" "
              value={params?.paymentType}
              onChange={handleParamsChange}
              required={false}
              data={paymentTypesModel}
              datakeys="value"
              datavalues="value"
              datalabeling="label"
            />
            <SelectInputFloating
              label="Payment Type"
              id="type"
              name="type"
              type=""
              placeholder=" "
              value={params?.type}
              onChange={handleParamsChange}
              required={false}
              data={transactionTypesModelValues}
              datakeys="value"
              datavalues="value"
              datalabeling="label"
            />
            <SelectInputFloating
              label="Bank"
              id="bank"
              name="bank"
              type=""
              placeholder=" "
              value={params?.bank}
              onChange={handleParamsChange}
              required={false}
              data={banks}
              datakeys="value"
              datavalues="value"
              datalabeling="label"
              // hidden={!payload.isCheckIssued}
            />
            <div className="relative  w-full mb-4">
              <label
                htmlFor="dateRange"
                className="block text-xs  mb-2 dark:text-white font-poppins font-extrabold"
              >
                Date Range
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={
                    params.startDate && params.endDate
                      ? new Date(params.startDate).toLocaleDateString() +
                        " - " +
                        new Date(params.endDate).toLocaleDateString()
                      : ""
                  }
                  onClick={() => setShowDatePicker(true)}
                  className="cursor-pointer border border-gray-300 w-full py-1 sm:py-1 px-3 block  outline-2 rounded-lg sm:text-xs focus:outline-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 font-semibold pr-8"
                />
                {/* X icon to clear date selection */}
                {params.startDate && params.endDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setParams((prev) => ({ ...prev, startDate: '', endDate: '' }));
                      setShowDatePicker(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 bg-white dark:bg-neutral-900 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800"
                    tabIndex={-1}
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
              {showDatePicker && (
                <div className="absolute z-50 bg-white shadow-lg mt-2">
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    ranges={[{
                      startDate: params.startDate ? new Date(params.startDate) : new Date(),
                      endDate: params.endDate ? new Date(params.endDate) : new Date(),
                      key: "selection"
                    }]}
                    className="w-full text-sm border-2 border-teal-700"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="mt-2 px-2 py-1 bg-gray-200 rounded"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60 text-xs"
              onClick={handleView}
              disabled={loading}
            >
              <Eye size={15} /> {loading ? "Filtering..." : "View"}
            </Button>
            
          </div>
        </div>
      )}
      <hr className="border-[#D9A404] border-1" />
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex gap-4 ">
          <CheckBox
            label="Bank Transfer"
            description="Pay with bank transfer"
            name="isBankTransfer"
            id="isBankTransfer"
            value={payload?.isBankTransfer}
            onChange={(e) =>
              setPayload({ ...payload, isBankTransfer: e.target.checked })
            }
            required={false}
          />
          <CheckBox
            label="Check Issue"
            description="Pay with Check"
            name="isCheckIssued"
            id="isCheckIssued"
            value={payload?.isCheckIssued}
            onChange={(e) =>
              setPayload({ ...payload, isCheckIssued: e.target.checked })
            }
            required={false}
          />
        </div>
        <Button
            className="flex items-center gap-1 bg-white text-black font-bold px-1 py-2 rounded-lg transition border border-gray-300 cursor-pointer hover:bg-[#EEEFE0] disabled:opacity-60 text-xs"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Cross size={15} /> {loading ? "Preparing..." : "Prepare Payment"}
          </Button>
      </div>

      <div className="w-full px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 lg:grid-cols-7 gap-4 outline-1 p-4 rounded-lg">
        <SelectInputFloating
          label="Payment Type"
          id="paymentType"
          name="paymentType"
          type=""
          placeholder=" "
          value={payload?.paymentType}
          onChange={handleEntryChange}
          required={true}
          data={paymentTypesModel}
          datakeys="value"
          datavalues="value"
          datalabeling="label"
        />
        <InputFloating
          label="Amount"
          id="amount"
          name="amount"
          type="number"
          placeholder=" "
          value={payload?.amount}
          onChange={handleEntryChange}
          required={true}
        />
        <InputFloating
          label="To"
          id="to"
          name="to"
          type="text"
          placeholder=" "
          value={payload?.to}
          onChange={handleEntryChange}
          required={true}
        />
        <InputFloating
          label="Reason"
          id="reason"
          name="reason"
          type="text"
          placeholder=" "
          value={payload?.reason}
          onChange={handleEntryChange}
          required={true}
        />
        <InputFloating
          label="Quantity"
          id="quantity"
          name="quantity"
          type="number"
          placeholder=" "
          value={payload?.quantity}
          onChange={handleEntryChange}
          required={true}
        />
        <SelectInputFloating
          label="Requested By"
          id="requestedBy"
          name="requestedBy"
          type=""
          placeholder={userLoading ? "Loading..." : " "}
          value={payload?.requestedBy}
          onChange={handleEntryChange}
          onClick={getUser}
          required={true}
          data={user}
          datakeys="_id"
          datavalues="_id"
          datalabeling="name"
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
          // hidden={!payload.isCheckIssued}
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
          hidden={!payload.isCheckIssued}
        />
        <SelectInputFloating
          label="Check Payment Type"
          id="checkType"
          name="checkType"
          type=""
          placeholder=" "
          value={payload?.checkType}
          onChange={handleEntryChange}
          required
          data={checkTypes}
          datakeys="value"
          datavalues="value"
          datalabeling="label"
          hidden={!payload.isCheckIssued}
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
          hidden={!payload.isCheckIssued}
        />
      </div>
      <hr className="border-[#D9A404] border-1" />

      <div className="flex justify-between items-center gap-2 w-full">
        <h3>Payments</h3>
      </div>

      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="overflow-hidden h-[290px] overflow-y-auto border border-gray-200 dark:border-neutral-700">
              {filterLoading ? <LoadingComponent /> : (

              <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="border border-gray-400 dark:border-neutral-700">
                  <tr class="divide-x divide-gray-200 dark:divide-neutral-700 border border-b border-gray-600 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800">
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-end text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate">Status</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate">TO</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-32 max-w-[10rem] truncate">REASON</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate">QUANTITY</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate">AMOUNT</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate">TYPE</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate">Date</th>                    
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate">BANK</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate">Reference</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-start text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate">PV NO.</th>
                    <th scope="col" className="sticky top-0 z-10 bg-white dark:bg-neutral-800 px-2 py-1 text-end text-xs font-semibold text-black uppercase dark:text-neutral-500 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {data.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        "odd:bg-gray-50 divide-x even:bg-white dark:odd:bg-neutral-800 dark:even:bg-neutral-900 hover:bg-yellow-100 dark:hover:bg-neutral-700 border border-gray-400 dark:border-neutral-700"
                      }
                    >
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">
                        {item.status === 'paid' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Paid
                          </span>
                        )}
                        {item.status === 'requested' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                            Requested
                          </span>
                        )}
                        {item.status === 'approved' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                            Approved
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                            Rejected
                          </span>
                        )}
                        {item.status === 'suspence' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                            Suspence
                          </span>
                        )}
                        {item.status === 'prepared' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></div>
                            Prepared
                          </span>
                        )}
                        {!['paid', 'requested', 'approved', 'rejected', 'suspence', 'prepared'].includes(item.status) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                            {item.status || 'Unknown'}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">{item.to}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-32 max-w-[10rem] truncate overflow-hidden">{item.reason}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">{item.quantity}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">{item.amount}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-20 max-w-[6rem] truncate overflow-hidden">{item.type}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">{formatDate(item.createdAt)}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">{item.bank || item.checkRequestId?.bank}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-24 max-w-[8rem] truncate overflow-hidden">
                        {editingRowId === item._id ? (
                          <input
                            className="border-green-600 border-2 rounded px-1 py-0.5 w-full text-xs"
                            value={editValues.recept_reference || ""}
                            onChange={e => setEditValues(v => ({ ...v, recept_reference: e.target.value }))}
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                            onClick={() => {
                              setEditingRowId(item._id);
                              setEditValues({ recept_reference: item.recept_reference || "" });
                            }}
                          >
                            {item.recept_reference || "N/A"}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">{item.serialNumber || item.checkSerialNumber || "N/A"}</td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200 border border-gray-400 dark:border-neutral-700 w-16 max-w-[4rem] truncate overflow-hidden">
                        {editingRowId === item._id ? (
                          <div className="flex gap-1">
                            <button
                              className="p-1 rounded bg-green-500 text-white hover:bg-green-600"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/checkTransaction/checkPrepare/${item._id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ recept_reference: editValues.recept_reference }),
                                  });
                                  const data = await res.json();
                                  if (res.ok && data.success) {
                                    toast.success("Reference updated successfully.");
                                    setData(data => data.map(d => d._id === item._id ? { ...d, recept_reference: editValues.recept_reference } : d));
                                    setEditingRowId(null);
                                    setEditValues({});
                                  } else {
                                    toast.error(data.message || "Failed to update.");
                                  }
                                } catch (err) {
                                  toast.error("Failed to update.");
                                }
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                              onClick={() => {
                                setEditingRowId(null);
                                setEditValues({});
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded hover:bg-muted transition cursor-pointer"
                              title="Actions"
                            >
                              <Ellipsis />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            { item.checkRequestId?.status == "prepared" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingRowId(item._id);
                                  setEditValues({
                                    recept_reference: item.recept_reference,
                                  });
                                }}
                              >
                                <SquareCheck enableBackground={true} color="green" className="w-4 h-4 mr-2 " /> <span className="text-green-600 font-semibold"> Pay</span>
                              </DropdownMenuItem>
                            )}
                          
                              
                              { item.type == "check_payment" || item.type == "bank_transfer" && (
                                  <DropdownMenuItem
                                      onClick={() => router.push(`/checks/${item._id}`)}
                                  >
                                    <NotebookPen  className="w-4 h-4 mr-2" /> {item.checkRequestId?.status == "prepared" ? "Edit" : "Prepare"}
                                  </DropdownMenuItem>
                                )}
                              
                              
                             
                            <DropdownMenuItem
                              onClick={() => {
                                window.open(
                                  `/transactions/${item._id}`,
                                  "_blank"
                                );
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Detail
                            </DropdownMenuItem>
                            
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `/checks/printInvoice/${item._id}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Printer className="w-4 h-4 mr-2" /> Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `/print-attachment/storeInOut/${item._id}`,
                                    "_blank"
                                  )
                                }
                              >
                                <ArrowUpDown className="w-4 h-4 mr-2" /> Store In/Out Attachment
                              </DropdownMenuItem>
                           
                           
                     
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
