import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toWords } from 'number-to-words';

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

function getName(user) {
  if (!user) return '';
  if (typeof user === 'object' && user.name) return user.name;
  return user;
}

export default function PrintCheckRequest() {
  const router = useRouter();
  const { checkRequestId, transactionId } = router.query;
  const [checkRequest, setCheckRequest] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Fetch checkRequest
        const resCheck = await fetch(`/api/checks?id=${checkRequestId}`);
        const dataCheck = await resCheck.json();
        if (!dataCheck.success) throw new Error(dataCheck.message);
        setCheckRequest(dataCheck.data);
        // Fetch transaction if transactionId is present
        if (transactionId) {
          const resTx = await fetch(`/api/transactions/${transactionId}`);
          const dataTx = await resTx.json();
          if (!dataTx.success) throw new Error(dataTx.message);
          setTransaction(dataTx.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    if (checkRequestId) fetchData();
  }, [checkRequestId, transactionId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!checkRequest) return <div className="p-8">No check request found.</div>;

  // Company info (customize as needed)
  const company = {
    name: 'GIRMA GIFAWOSSEN TRADING',
    address: 'Addis Ababa, Ethiopia Akaki Kality',
    phone: '+251 911 500 000',
    email: 'girma@gmail.com',
  };

  // Watermark/label logic
  const label = 'ORIGINAL';

  // Use transaction if available, else checkRequest for info
  const to = checkRequest.to || (transaction && transaction.to) || '';
  const amount = checkRequest.amount || (transaction && transaction.amount) || 0;
  const formattedAmount = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const reason = checkRequest.reason || (transaction && transaction.reason) || '';
  const preparedBy = getName(checkRequest.requestedBy);
  const approvedBy = getName(checkRequest.approvedBy);
  // For demo, checkedBy is left blank or you can add logic
  const checkedBy = '';

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white p-10 rounded-xl shadow print:shadow-none print:bg-white print:p-0 relative border border-gray-300 text-gray-900">
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
          <div className="w-24 h-24 relative">
            {/* You can use next/image if you have a logo */}
            {/* <Image src="/Logo.png" alt="Company Logo" fill style={{objectFit:'contain'}}/> */}
          </div>
          <div className="text-xl font-extrabold text-gray-700 ml-2">{company.name}</div>
        </div>
        <div className="text-xs text-right text-gray-600">
          {company.address}<br />
          Phone: {company.phone}<br />
          Email: {company.email}
        </div>
      </div>
      <div className="text-center font-bold text-lg underline mb-2 tracking-wide">ADVANCE PAYMENT REQUEST</div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-semibold">Date: <span className="font-normal underline min-w-[100px] inline-block">{checkRequest.issuedAt ? new Date(checkRequest.issuedAt).toLocaleDateString() : ''}</span></div>
        {checkRequest.checkNumber && (
          <div className="text-xs font-semibold">Check No: <span className="font-mono text-base">{checkRequest.checkNumber}</span></div>
        )}
      </div>
      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm">
        <div><span className="font-semibold">Recipient:</span> {to || '-'}</div>
        <div><span className="font-semibold">Bank:</span> {checkRequest.bank || '-'}</div>
        <div><span className="font-semibold">Reason:</span> {reason || '-'}</div>
        <div><span className="font-semibold">Type:</span> {checkRequest.type || '-'}</div>
        <div><span className="font-semibold">Amount:</span> {formattedAmount}</div>
        <div><span className="font-semibold">Notes:</span> {checkRequest.notes || '-'}</div>
      </div>
      {/* Table for clarity */}
      <table className="w-full border text-xs mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Recipient</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1 min-w-[120px]">{to || ''}</td>
            <td className="border px-2 py-1 min-w-[120px]">{reason || ''}</td>
            <td className="border px-2 py-1 min-w-[80px] text-right">{formattedAmount}</td>
          </tr>
        </tbody>
      </table>
      {/* Amount in words */}
      <div className="text-xs mb-1">Amount in words: <span className="font-semibold italic">{birrToWords(amount)}</span></div>
      {/* Requested By and Approved By */}
      <div className="flex justify-between mt-8 text-xs gap-8">
        <div className="flex flex-col items-center flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex items-center justify-center text-base font-semibold">
            {preparedBy}
          </div>
          <div className="mt-1">Prepared By</div>
          <div className="border-b border-gray-400 min-w-[120px] h-6 mt-4" />
          <div className="mt-1">Prepared By (Signature)</div>
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex items-center justify-center text-base font-semibold">
            {approvedBy}
          </div>
          <div className="mt-1">Approved By (Name)</div>
          <div className="border-b border-gray-400 min-w-[120px] h-6 mt-4" />
          <div className="mt-1">Approved By (Signature)</div>
        </div>
        {/* Checked By Column */}
        <div className="flex flex-col items-center flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex items-center justify-center text-base font-semibold">
            {checkedBy}
          </div>
          <div className="mt-1">Checked By</div>
          <div className="border-b border-gray-400 min-w-[120px] h-6 mt-4" />
          <div className="mt-1">Signature</div>
        </div>
      </div>
      {/* Footer/Notes */}
      <div className="mt-8 text-xs text-gray-500 border-t pt-2">
        <div>Generated by the system on {new Date().toLocaleString()}</div>
        <div>For any inquiries, contact {company.email} or {company.phone}</div>
      </div>
      <div className="mt-8 flex justify-end gap-2 print:hidden">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.print()}
        >
          Print
        </button>
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => router.push('/checks')}
        >
          Close
        </button>
      </div>
    </div>
  );
} 