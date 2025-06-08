import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Trash2,
  XCircle,
  User,
  Calendar,
  Truck,
  FilePlus,
} from "lucide-react";

export default function NewTransactionRequestPage() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const [form, setForm] = useState({
    transactionSource: "cashAccount",
    status: "",
    cashAccount: "",
    checkRequestId: "",
    type: "",
    suspenceAmount: "",
    returnAmount: "",
    date: "",
    pitiCash: false,
    amount: "",
    to: "",
    reason: "",
    relatedReceiptUrl: "",
    approvedBy: "",
    requestedBy: auth?.id || "",
    createdBy: auth?.id || "",
    quantity: "",
    recept_reference: "",
  });
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/users");
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/vehicles");
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      }
    };
    fetchVehicles();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let newForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };
    // Status logic
    if (name === "transactionSource") {
      if (value === "cashAccount") {
        newForm.status = newForm.type === "suspence" ? "suspence" : "requested";
        newForm.checkRequestId = "";
      } else if (value === "checkRequestId") {
        newForm.status = "paid";
        newForm.cashAccount = "";
      }
    }
    if (name === "type") {
      if (value === "suspence") {
        newForm.status = "suspence";
      } else if (form.transactionSource === "cashAccount") {
        newForm.status = "requested";
      }
    }
    setForm(newForm);
  }

  async function handleSubmit(entries, e) {
    e.preventDefault && e.preventDefault();
    setFormError("");
    setError(null);
    if (submitting) return;
    setSubmitting(true);
    let allSuccess = true;
    let lastError = null;
    try {
      // Validate required fields for each entry
      for (const formEntry of entries) {
        if (!formEntry.requestedBy || !formEntry.type || !formEntry.reason) {
          setFormError("Please fill all required fields.");
          allSuccess = false;
          break;
        }
        // Add more validation as needed
      }
      if (!allSuccess) return;
      for (const formEntry of entries) {
        let payload = {
          status: formEntry.status || "requested",
          type: formEntry.type,
          reason: formEntry.reason,
          requestedBy: formEntry.requestedBy,
          requestedAt: formEntry.requestedAt,
          createdBy: auth?.id,
        };
        const selectedUser = users.find((u) => u._id === formEntry.requestedBy);
        const isTransporter = selectedUser?.role === "transporter";
        if (isTransporter) {
          payload.vehicleId = formEntry.vehicleId;
          if (vehicleRows.length > 0) {
            payload.vehicleMaintenance = vehicleRows;
          } else if (vehicleRow.vehicleId && vehicleRow.description && vehicleRow.amount) {
            payload.vehicleMaintenance = [vehicleRow];
          }
        }
        if (formEntry.type === "receipt_payment") {
          payload.amount = formEntry.amount;
          payload.to = formEntry.to;
          payload.quantity = Number(formEntry.quantity);
          payload.recept_reference = formEntry.recept_reference;
        } else if (formEntry.type === "suspence_payment") {
          payload.suspenceAmount = formEntry.suspenceAmount;
          payload.quantity = Number(formEntry.quantity);
        }
        // TODO: handle file upload for relatedReceiptFile if needed
        console.log(payload)
        try {
          const res = await fetch("/api/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!data.success) {
            allSuccess = false;
            lastError = data.message || "Failed to create transaction.";
            setFormError(lastError);
          }
        } catch (err) {
          allSuccess = false;
          lastError = "Failed to create transaction.";
          setFormError(lastError);
        }
      }
      if (allSuccess) {
        setForm({
          transactionSource: "cashAccount",
          status: "requested",
          cashAccount: "",
          checkRequestId: "",
          type: "",
          suspenceAmount: "",
          returnAmount: "",
          date: "",
          pitiCash: false,
          amount: "",
          to: "",
          reason: "",
          relatedReceiptUrl: "",
          approvedBy: "",
          requestedBy: auth?.id || "",
          createdBy: auth?.id || "",
          quantity: "",
          recept_reference: "",
        });
        // Optionally redirect or show a success message
        setFormError("");
        router.push("/transactions");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    router.push("/transactions");
  }

  // --- Begin inlined TransactionRequestform ---
  const defaultEntry = {
    amount: "",
    quantity: "",
    recept_reference: "",
    to: "",
    reason: "",
    suspenceAmount: "",
    vehicleId: "",
  };
  // Common fields
  const [commonFields, setCommonFields] = useState({
    requestedBy: form.requestedBy || "",
    requestedAt: form.requestedAt || new Date().toISOString().split("T")[0],
  });
  // Single entry
  const [entry, setEntry] = useState({ ...defaultEntry });
  const [paymentType, setPaymentType] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [quantityError, setQuantityError] = useState("");

  const selectedUser = users.find((u) => u._id === commonFields.requestedBy);
  const isTransporter = selectedUser?.role === "transporter";

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    setEntry({ ...defaultEntry });
  };

  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    setCommonFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntryChange = (e) => {
    const { name, value, type, files } = e.target;
    setEntry((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const resetForm = () => {
    setCommonFields({
      requestedBy: "",
      requestedAt: new Date().toISOString().split("T")[0],
    });
    setEntry({ ...defaultEntry });
    setPaymentType("");
    setVehicleError("");
    setQuantityError("");
  };
  // --- End inlined TransactionRequestform ---

  // --- Begin vehicle-description-amount add section ---
  const [vehicleRow, setVehicleRow] = useState({
    vehicleId: "",
    description: "",
    amount: "",
  });
  const [vehicleRows, setVehicleRows] = useState([]);

  const handleVehicleRowChange = (e) => {
    const { name, value } = e.target;
    setVehicleRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicleRow = (e) => {
    e.preventDefault();
    if (!vehicleRow.vehicleId || !vehicleRow.description || !vehicleRow.amount)
      return;
    setVehicleRows((prev) => [...prev, vehicleRow]);
    setVehicleRow({ vehicleId: "", description: "", amount: "" });
  };

  // Add the remove handler
  const handleRemoveVehicleRow = (idx) => {
    setVehicleRows((prev) => prev.filter((_, i) => i !== idx));
  };
  // --- End vehicle-description-amount add section ---

  return (
    <div
      className="w-full"
      
    >
      <div className="flex items-center justify-between">
        <h2 className="text-md font-extrabold flex items-center gap-2 text-blue-900">
          <FilePlus className="text-blue-500" size={20} />Payment Request
        </h2>
        {/* Payment Type Selection */}
        <div className="flex gap-8 justify-center">
          <label
            className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer border transition-all ${
              paymentType === "receipt_payment"
                ? "bg-blue-100 border-blue-400 text-blue-900 font-light shadow"
                : "bg-gray-50 border-gray-200 hover:bg-blue-50"
            }`}
            title="Request for a receipt payment"
          >
            <input
              type="radio"
              name="paymentType"
              value="receipt_payment"
              checked={paymentType === "receipt_payment"}
              onChange={() => handlePaymentTypeChange("receipt_payment")}
              className="accent-blue-500"
            />
            Receipt Payment
          </label>
          <label
            className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer border transition-all ${
              paymentType === "suspence_payment"
                ? "bg-blue-100 border-blue-400 text-blue-900 font-light shadow"
                : "bg-gray-50 border-gray-200 hover:bg-blue-50"
            }`}
            title="Request for a suspence payment"
          >
            <input
              type="radio"
              name="paymentType"
              value="suspence_payment"
              checked={paymentType === "suspence_payment"}
              onChange={() => handlePaymentTypeChange("suspence_payment")}
              className="accent-blue-500"
            />
            Suspence Payment
          </label>
        </div>
      </div>
      {/* Only show the form after a payment type is selected */}
      {paymentType && (
        <form
          onSubmit={(e) => {
            let hasError = false;
      
            if (
              !entry.quantity ||
              isNaN(Number(entry.quantity)) ||
              Number(entry.quantity) <= 0
            ) {
              setQuantityError("Quantity must be greater than 0");
              hasError = true;
            } else {
              setQuantityError("");
            }
            if (hasError) {
              e.preventDefault();
              return;
            }
            // Compose payload for the entry
            const formEntry = {
              ...entry,
              status: "requested",
              type: paymentType,
              createdBy: auth?.id,
              requestedBy: commonFields.requestedBy,
              requestedAt: commonFields.requestedAt,
            };
            // Call onSubmit with the single entry in an array
            e.preventDefault();
            handleSubmit([formEntry], e);
            resetForm();
          }}
          className=""
        >
          {/* Common Fields */}
          <div className="flex flex-col gap-4 bg-[#FFFFFF] rounded-lg p-4 mb-2 border border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-start justify-items-start gap-3">
                <div className="flex items-center mb-2">
                  <label className="text-blue-900 font-light whitespace-nowrap min-w-[100px] flex items-center gap-1">
                    <User size={18} /> Requester
                  </label>
                  <select
                    name="requestedBy"
                    value={commonFields.requestedBy}
                    onChange={handleCommonChange}
                    className="flex-1 w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                    required
                    disabled={isTransporter}
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center mb-2">
                  <label className="text-blue-900 font-light whitespace-nowrap min-w-[70px] flex items-center gap-1">
                    <Calendar size={18} /> Date
                  </label>
                  <input
                    type="date"
                    name="requestedAt"
                    value={commonFields.requestedAt}
                    onChange={handleCommonChange}
                    className="flex-1 w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="flex items-center gap-2 bg-white text-black font-bold px-1 py-7 rounded-lg transition border border-gray-300 cursor-pointer hover:white disabled:opacity-60"
                disabled={submitting}
              >
                <FilePlus size={20} /> {submitting ? "Saving..." : "Save"}
              </Button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className=" relative bg-white border-2 border-blue-100 rounded-xl shadow-sm p-5 transition hover:shadow-lg group">
                {/* Fields for receipt_payment */}
                {paymentType === "receipt_payment" && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={entry.amount}
                        onChange={handleEntryChange}
                        placeholder="Amount in cash"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={entry.quantity || ""}
                        onChange={handleEntryChange}
                        placeholder="Quantity"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                      {quantityError && (
                        <div className="text-red-500 text-xs mt-1">
                          {quantityError}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Reference
                      </label>
                      <input
                        type="text"
                        name="recept_reference"
                        value={entry.recept_reference || ""}
                        onChange={handleEntryChange}
                        placeholder="Receipt Reference"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        To
                      </label>
                      <input
                        type="text"
                        name="to"
                        value={entry.to}
                        onChange={handleEntryChange}
                        placeholder="Recipient of the payment"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Reason
                      </label>
                      <input
                        type="text"
                        name="reason"
                        value={entry.reason}
                        onChange={handleEntryChange}
                        placeholder="Reason for the payment "
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                    </div>
                  </>
                )}
                {/* Fields for suspence_payment */}
                {paymentType === "suspence_payment" && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Amount
                      </label>
                      <input
                        type="number"
                        name="suspenceAmount"
                        value={entry.suspenceAmount}
                        onChange={handleEntryChange}
                        placeholder="Amount in cash"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={entry.quantity || ""}
                        onChange={handleEntryChange}
                        placeholder="Quantity"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                      {quantityError && (
                        <div className="text-red-500 text-xs mt-1">
                          {quantityError}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[#444444] text-sm font-bold whitespace-nowrap min-w-[70px]">
                        Reason
                      </label>
                      <input
                        type="text"
                        name="reason"
                        value={entry.reason}
                        onChange={handleEntryChange}
                        placeholder="Reason for the payment"
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="block ">
                {isTransporter && (
                  <>
                    <div className="flex items-end gap-3 mb-4">
                      <div className="flex flex-col" style={{ minWidth: 180 }}>
                        <label className="text-[#444444] text-sm font-bold mb-1">
                          Vehicle
                        </label>
                        <select
                          name="vehicleId"
                          value={vehicleRow.vehicleId}
                          onChange={handleVehicleRowChange}
                          className="border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white min-w-[140px] max-w-[200px]"
                        >
                          <option value="">Select Vehicle</option>
                          {vehicles.map((vehicle) => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.plate}
                              {vehicle.model ? ` - ${vehicle.model}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col" style={{ minWidth: 180 }}>
                        <label className="text-[#444444] text-sm font-bold mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={vehicleRow.description}
                          onChange={handleVehicleRowChange}
                          className="border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white min-w-[140px] max-w-[200px]"
                          placeholder="Description"
                        />
                      </div>
                      <div className="flex flex-col" style={{ minWidth: 120 }}>
                        <label className="text-[#444444] text-sm font-bold mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          name="amount"
                          value={vehicleRow.amount}
                          onChange={handleVehicleRowChange}
                          className="border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition bg-white min-w-[80px] max-w-[120px]"
                          placeholder="Amount"
                        />
                      </div>
                      <button
                        className="ml-2 px-4 py-1  text-blue-700 rounded hover:bg-gray-100 transition font-bold border border-blue-700 cursor-pointer"
                        onClick={handleAddVehicleRow}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                    {/* Table of added rows */}
                    {vehicleRows.length > 0 && (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-gray-200 rounded">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                Vehicle
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                Description
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                Amount
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">
                                Remove
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicleRows.map((row, idx) => {
                              const vehicle = vehicles.find(
                                (v) => v._id === row.vehicleId
                              );
                              return (
                                <tr key={idx} className="border-t">
                                  <td className="px-4 py-2 text-sm">
                                    {vehicle
                                      ? `${vehicle.plate}${
                                          vehicle.model
                                            ? " - " + vehicle.model
                                            : ""
                                        }`
                                      : ""}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {row.description}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {row.amount}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <button
                                      type="button"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        handleRemoveVehicleRow(idx)
                                      }
                                      title="Remove"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

            
        </form>
      )}
      {/* Show error message if present */}
      {formError && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2 mb-2 text-sm">
          {formError}
        </div>
      )}
    </div>
  );
}
