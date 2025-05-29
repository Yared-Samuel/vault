import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toWords } from 'number-to-words';
import Image from 'next/image';

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
function birrToWords(amount) {
  if (!amount) return '';
  const [birr, cents] = Number(amount).toFixed(2).split('.');
  let words = capitalizeWords(toWords(Number(birr))) + ' Birr';
  if (Number(cents) > 0) {
    words += ' and ' + capitalizeWords(toWords(Number(cents))) + ' Cents';
  }
  words += ' Only';
  return words;
}

export default function InvoicePage() {
  const router = useRouter();
  const { id, original } = router.query;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (original === '1' && transaction) {
      setTimeout(() => window.print(), 500);
    }
  }, [original, transaction]);

  useEffect(() => {
    if (!id) return;
    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/transactions/${id}`);
        const data = await res.json();
        if (data.success) {
          setTransaction(data.data);
        } else {
          setError(data.message || 'Failed to fetch transaction.');
        }
      } catch (err) {
        setError('Failed to fetch transaction.');
      }
      setLoading(false);
    };
    fetchTransaction();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!transaction) return null;

  // Company info (customize as needed)
  const company = {
    name: 'GIRMA GIFAWOSSEN TRADING',
    address: 'Addis Ababa, Ethiopia Akaki Kality',
    phone: '+251 911 500 000',
    email: 'girma@gmail.com',
  };

  // Watermark/label logic
  const label = original === '1' ? 'ORIGINAL' : 'COPY';

  // Amount
  const amount = transaction.amount || transaction.suspenceAmount || 0;
  const formattedAmount = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-2xl mx-auto my-8  p-10 rounded-xl shadow print:shadow-none print:bg-white print:p-2 relative border border-gray-300 text-gray-900">
      {/* Watermark or label */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0"
        style={{
          fontSize: '5rem',
          fontWeight: 'bold',
          color: 'rgba(156,163,175,0.18)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
        }}
      >
        {label}
      </div>
      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-18 h-18 relative">
            <Image src="/Logo.png" alt="Company Logo" fill style={{objectFit:'contain'}}/>
          </div>
          <div className="text-xl font-extrabold text-gray-700 ml-2">{company.name}</div>
        </div>
      
      </div>
      <div className=" text-xs text-right text-gray-600">
          {company.address} -    -
          Phone: {company.phone} -  -
          Email: {company.email}
        </div>
      <div className="text-center font-bold text-lg underline mb-2 tracking-wide">
        Suspence Payment
        {/* <span className="block text-xs">የጥቃቅን ወጪ መክፈያ ሰነድ</span> */}
        </div>
      <div className="flex flex-col items-end mb-4">
        <div className="text-xs font-semibold">Date: <span className="font-normal underline min-w-[100px] inline-block">{transaction.requestedAt ? new Date(transaction.requestedAt).toLocaleDateString() : ''}</span></div>
        {transaction.serialNumber && (
          <div className="text-xs font-semibold">NO: <span className="font-mono text-base">{transaction.serialNumber}</span></div>
        )}
      </div>
      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm">
        <div><span className="font-semibold">Paid To:</span> {transaction.to || '-'}</div>
        <div><span className="font-semibold">Reason:</span> {transaction.reason || '-'}</div>
        <div><span className="font-semibold">Type:</span> Suspence Payment</div>
        <div><span className="font-semibold">Vehicle:</span> {transaction.vehicleId?.plate || '-'}</div>

        
      </div>
      {/* Table for clarity */}
      <table className="w-full border text-xs mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Reason</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1 min-w-[120px]">{transaction.reason || ''}</td>
            <td className="border px-2 py-1 min-w-[60px] text-center">{transaction.quantity ?? '-'}</td>
            <td className="border px-2 py-1 min-w-[80px] text-right">{formattedAmount}</td>
          </tr>
        </tbody>
      </table>
      {/* Amount in words */}
      <div className="text-xs text-right mb-1">Amount in words: <span className="font-semibold italic">{birrToWords(amount)}</span></div>
      {/* Requested By and Approved By */}
      <div className="mt-8 text-xs">
        <div className="grid grid-cols-3 gap-8">
          
          {/* Finance Manager */}
          <div className="flex flex-col items-start">
            <div className="border-b border-gray-400 min-w-[160px] h-7 flex items-center text-base font-semibold mb-1">
              Biruk Wubshet
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="w-24">Finance Manager</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5">Sign</span>
                <span className="flex-1 border-b border-gray-400 h-5"></span>
              </div>
              
            </div>
          </div>
          {/* Approved By */}
          <div className="flex flex-col items-start">
            <div className="border-b border-gray-400 min-w-[160px] h-7 flex items-center text-base font-semibold mb-1">
              {transaction.approvedBy?.name || <span className="text-gray-400">Name</span>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="w-24">Approved By</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5">Sign</span>
                <span className="flex-1 border-b border-gray-400 h-5"></span>
              </div>
              
            </div>
          </div>
          {/* Requested By/Recipient */}
          <div className="flex flex-col items-start">
            <div className="border-b border-gray-400 min-w-[160px] h-7 flex items-center text-base font-semibold mb-1">
              {transaction.requestedBy?.name || <span className="text-gray-400">Name</span>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="w-40">Requested By/Recipient</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-">Sign</span>
                <span className="flex-1 border-b border-gray-400 h-5"></span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      {/* Footer/Notes */}
      <div className="mt-8 text-xs text-gray-500 border-t pt-2">
        <div>Generated by the system on {new Date().toLocaleString()}</div>
        <div>For any inquiries, contact {company.email} or {company.phone}</div>
      </div>
    </div>
  );
} 