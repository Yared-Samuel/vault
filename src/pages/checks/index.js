import { useEffect, useState } from "react";
import { banks, checkTypes } from "@/lib/constants";
import { toWords } from "number-to-words";
import { useRouter } from "next/router";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRequireRole } from '@/lib/roles';
import CheckPayModal from '@/components/checks/CheckPayModal';

// Utility to capitalize the first letter of every word
function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Utility to convert birr and cents to words
function birrToWords(amount) {
  const [birr, cents] = Number(amount).toFixed(2).split(".");
  let words = capitalizeWords(toWords(Number(birr))) + " Birr";
  if (Number(cents) > 0) {
    words += " and " + capitalizeWords(toWords(Number(cents))) + " Cents";
  }
  words += " Only";
  return words;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ChecksPage() {
  // const isAuthorized = useRequireRole(["admin", "accountant"]);
  // if (!isAuthorized) {
  //   return <div className="text-center text-red-600 font-bold text-xl mt-10">Not authorized</div>;
  // }
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [payModal, setPayModal] = useState({ open: false, check: null });
  const [selectedCashAccount, setSelectedCashAccount] = useState('');
  const [cashAccounts, setCashAccounts] = useState([]);

  useEffect(() => {
    async function fetchChecks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/checks");
        const data = await res.json();
        if (res.ok && data.success) {
          setChecks(data.data);
        } else {
          setError(data.message || "Failed to fetch check requests.");
        }
      } catch (err) {
        setError("Failed to fetch check requests.");
      }
      setLoading(false);
    }
    fetchChecks();
  }, []);

  useEffect(() => {
    async function fetchCashAccounts() {
      try {
        const res = await fetch('/api/cash');
        const data = await res.json();
        setCashAccounts(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchCashAccounts();
  }, []);

  // Handler for status change (calls backend API)
  async function handleStatusChange(id, newStatus) {
    toast(
      `Are you sure you want to set this check as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}?`,
      {
        action: {
          label: 'Confirm',
          onClick: async () => {
            try {
              const res = await fetch('/api/checks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
              });
              const data = await res.json();
              if (data.success) {
                window.location.reload();
              } else {
                toast.error(data.message || 'Failed to update status');
              }
            } catch (err) {
              toast.error('Failed to update status');
            }
          },
        },
        cancel: {
          label: 'Cancel',
        },
      }
    );
  }

  // Handler for paying a check
  async function handlePayCheck(fields) {
    try {
      let payload; 
      if (payModal.check?.type === 'petty_cash' || payModal.check?.type === 'fuel') {
        // Only send id and status for petty_cash and fuel
        payload = {
          id: payModal.check._id,
          status: 'paid',
          type: payModal.check?.type,
        };
      } else {
        // For other types, send all fields
        payload = {
          id: payModal.check._id,
          status: 'paid',
          cashAccountId: fields.cashAccountId,
          recept_reference: fields.recept_reference,
          relatedReceiptUrl: fields.relatedReceiptUrl,
        };
      }
      const res = await fetch('/api/checks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setPayModal({ open: false, check: null });
        setSelectedCashAccount('');
        // Refresh checks
        const resChecks = await fetch('/api/checks');
        const dataChecks = await resChecks.json();
        if (dataChecks.success) setChecks(dataChecks.data);
        // Open print page
        window.open(`/checks/print?checkRequestId=${payModal.check._id}`, '_blank');
        toast.success('Check paid successfully!');
      } else {
        toast.error(data.message || 'Payment failed.');
      }
    } catch (err) {
      toast.error('Payment failed.');
    }
  }

  // Filtering logic
  const filteredChecks = checks.filter(check =>
    (statusFilter === '' || check.status === statusFilter) &&
    (bankFilter === '' || check.bank === bankFilter) &&
    (typeFilter === '' || check.type === typeFilter)
  );

  return (
    <div className="flex justify-center w-full">
      <div className="w-full  mx-1">
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Check Monitoring</h1>
        <Button>
          <Link href="/checks/new">
            <span>New Check</span>
          </Link>
        </Button>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="border rounded px-2 py-1" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="border rounded px-2 py-1" value={bankFilter} onChange={e => setBankFilter(e.target.value)}>
            <option value="">All Banks</option>
            {banks.map(bank => <option key={bank.value} value={bank.value}>{bank.label}</option>)}
          </select>
          <select className="border rounded px-2 py-1" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {checkTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : filteredChecks.length === 0 ? (
          <div className="text-center py-4">No check requests found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChecks.map((check) => {
              const bankInfo = banks.find(b => b.value === check.bank);
              const primaryColor = bankInfo?.primaryColor || '#f3f4f6';
              const secondaryColor = bankInfo?.secondaryColor || '#fff';
              return (
                <div
                  key={check._id}
                  className="bg-white border-2 rounded-xl shadow-md px-2 py-2 flex flex-col gap-0 relative transition-transform duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:scale-[1.025] "
                  style={{
                    fontFamily: "serif",
                    borderColor: primaryColor,
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white " style={{backgroundColor: secondaryColor, padding: '2px 4px', borderRadius: '5px', color: primaryColor}}>
                      {check.type.charAt(0).toUpperCase() + check.type.slice(1)} Check
                    </span>
                    <span className="text-gray-700 text-sm font-bold">
                      {check.issuedAt ? new Date(check.issuedAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                  <div>
                      <span className="text-sm text-gray-600">To: <span className="font-semibold">{check.to || "-"}</span></span>
                    </div>
                    <span className="text-lg text-gray-600"><span className="font-semibold" style={{ color: primaryColor }}>{check.bank ? check.bank.charAt(0).toUpperCase() + check.bank.slice(1) : "-"}</span></span>
                  </div>
                  <div className="flex flex-row flex-wrap justify-between items-center border border-dashed border-gray-400 rounded px-3 py-2 my-2 bg-gray-50">
                    <span className="text-xs italic text-gray-700 font-semibold text-left max-w-[60%] break-words">
                      {check.amount ? birrToWords(check.amount) : ''}
                    </span>
                    <span className="text-1xl font-bold text-green-700 tracking-wider">
                      {Number(check.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr
                    </span>
                  </div>
                  <div className="flex justify-between ">
                    
                    <span style={{ color: secondaryColor, backgroundColor: primaryColor, padding: '2px 4px', borderRadius: '5px', color: secondaryColor }}>{check.checkNumber || "-"}</span>
                    <div className="flex flex-row items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>Prepared By: <span className="font-semibold text-gray-700">{check.requestedBy?.name || "-"}</span></span>
                      <span className="mx-1">|</span>
                      <span>Type: <span className="font-semibold text-gray-700">{check.type.charAt(0).toUpperCase() + check.type.slice(1)}</span></span>
                    </div>
                  </div>
                
                  <div className="mt-6 flex justify-end">
                    {check.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          className="w-24 text-center text-xs font-bold py-2 rounded-full border border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 transition-colors cursor-pointer"
                          onClick={() => handleStatusChange(check._id, 'approved')}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="w-20 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            setPayModal({ open: true, check });
                            setSelectedCashAccount('');
                          }}
                          type="button"
                        >
                          Pay
                        </button>
                        <button
                          className="w-24 text-center text-xs font-bold py-2 rounded-full border border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-colors cursor-pointer"
                          onClick={() => handleStatusChange(check._id, 'rejected')}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {check.status === 'approved' && (
                      <div className="flex gap-2">
                        <button
                          className="w-20 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            setPayModal({ open: true, check });
                            setSelectedCashAccount('');
                          }}
                          type="button"
                        >
                          Pay
                        </button>
                        <button
                          className="w-24 text-center text-xs font-bold py-2 rounded-full border border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-colors cursor-pointer"
                          onClick={() => handleStatusChange(check._id, 'rejected')}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {check.status === 'rejected' && (
                      <button
                        className="w-24 text-center text-xs font-bold py-2 rounded-full border border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-colors cursor-pointer"
                        onClick={() => handleStatusChange(check._id, 'pending')}
                        type="button"
                      >
                        Appeal
                      </button>
                    )}
                    {check.status === 'paid' && (
                      <span
                        className="w-40 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 bg-blue-50"
                        style={{ display: 'inline-block' }}
                      >
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Check Pay Modal */}
      <CheckPayModal
        open={payModal.open}
        check={payModal.check}
        onClose={() => {
          setPayModal({ open: false, check: null });
        }}
        onPay={handlePayCheck}
      />
    </div>
  );
}