import React, { useEffect, useState } from "react";
const SuspenceModal = ({
  open,
  tx,
  cashAccounts,
  selectedCashAccount,
  onAccountChange,
  onClose,
  onSuspence,
}) => {
  const [localError, setLocalError] = useState("");
  const [newSuspenceAmount, setNewSuspenceAmount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setNewSuspenceAmount(tx?.suspenceAmount || 0);
    setReason(tx?.reason || "");
    setLocalError("");
  }, [open, tx]);

  const handleSuspence = (event) => {
    event.preventDefault();
    if (!selectedCashAccount) {
      setLocalError("Please select a cash account.");
      return;
    }
    if (tx.type !== "suspence_payment" || !tx.suspenceAmount) {
      setLocalError("Invalid transaction type");
      return;
    }
    setLocalError("");
    onSuspence({
      newSuspenceAmount: Number(newSuspenceAmount),
      id: tx._id,
      cashAccountId: selectedCashAccount,
      reason,
    });
  };
  if (!open || !tx) return null;
  return (
    <>
      <div
        id="crud-modal"
        tabIndex="-1"
        // aria-hidden="true"
        className={`$${open ? "block" : "hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full backdrop-blur-sm`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <form onSubmit={handleSuspence} className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pay suspence Payment
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-toggle="crud-modal"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            {/* Show error if exists */}
            {localError && (
              <div className="text-red-500 text-sm mb-2 px-4 pt-2">{localError}</div>
            )}

            <div className="flex p-2">
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="cashAccount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Cash Account
                </label>
                <select
                  id="cashAccount"
                  value={selectedCashAccount}
                  onChange={onAccountChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                >
                  <option value="">Select account</option>
                  {cashAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} &mdash; Balance: {account.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="suspenceAmount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Suspence Amount
                </label>
                <input
                  type="number"
                  value={newSuspenceAmount}
                  onChange={(e) => setNewSuspenceAmount(e.target.value)}
                  id="suspenceAmount"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div className="w-full p-2">
              <label
                htmlFor="suspenceReason"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Suspence Reason
              </label>
              <textarea
                id="suspenceReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="2"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Write product description here"
              ></textarea>
            </div>

            <button
              type="submit"
              className="text-white py-2 px-4 inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 cursor-pointer focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              Approve Suspence
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SuspenceModal;
