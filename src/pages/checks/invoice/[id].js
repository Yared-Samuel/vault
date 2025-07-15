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
    phone: '+251 911 230 025 / +251 930 505 458',
    email: 'girma@gmail.com',
  };

  // Watermark/label logic
  const label = 'ORIGINAL'

  // Amount
  const amount = transaction.amount || transaction.suspenceAmount || 0;
  const formattedAmount = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          <div className="w-18 h-18 relative">
            <Image src="/Logo.png" alt="Company Logo" fill style={{objectFit:'contain'}}/>
          </div>
          <div className="text-xl font-extrabold text-gray-700 ml-2">{company.name}</div>
        </div>
      
      </div>
      <div className=" text-xs text-right text-gray-600">
          {company.address} -    -
          {/* Phone: {company.phone} -  - */}
          Email: {company.email}
        </div>
      <div className="text-center font-bold text-lg underline mb-2 tracking-wide">
        Check Payment Voucher
        <span className="block text-xs">ቼክ መክፈያ ሰነድ</span>
        </div>
      <div className="flex flex-col items-end mb-4">
        <div className="text-xs font-semibold">Date: <span className="font-normal underline  ">{new Date().toLocaleDateString()}</span></div>
        {transaction.checkSerialNumber && (
          <div className="text-xs font-semibold">CPV No: <span className="font-mono text-base">{String(transaction.checkSerialNumber).padStart(6, '0')}</span></div>
        )}
      </div>
      {/* Main Info Table */}
      <table className="w-full mb-4 text-sm border border-gray-300">
        <tbody>
          <tr>
            <td className="border border-gray-300 font-semibold w-2/4">Paid To</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.to || '-'}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 font-semibold">Amount</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.amount || '-'}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 font-semibold">Reason</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.reason || '-'}</td>
          </tr>
          {
            transaction.type === "bank_transfer" && 
          (<tr>
            <td className="border border-gray-300 font-semibold">Bank</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.bank || '-'}</td>
          </tr>)
          }
          
          {
            transaction.type === "check_payment" && 
          (<tr>
            <td className="border border-gray-300 font-semibold">Check No ( {transaction.checkRequestId?.bank.toUpperCase()} Bank)</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.checkRequestId?.checkNumber || '-'}</td>
          </tr>)
          
          
          }
           {
            transaction.type === "check_payment" && 
          (
          <tr>
            <td className="border border-gray-300 font-semibold">Notes</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.checkRequestId?.notes || '-'}</td>
          </tr>
          )}
          <tr>
            <td className="border border-gray-300 font-semibold">Transaction Type</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.paymentType }</td>
          </tr>
          <tr>
            <td className="border border-gray-300 font-semibold">Product Quantity</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.quantity || '-'}</td>
          </tr>
        </tbody>
      </table>
      {/* Table for clarity */}
      {transaction.vehicleMaintenance && transaction.vehicleMaintenance.length > 0 ? (
      
       
        <table className="w-full border text-xs mb-2 mt-8">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Vehicle</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transaction.vehicleMaintenance.map((item) => (
              <tr key={item._id}>
                <td className="border px-2 py-1 min-w-[120px]">
                  {item.vehicleId?.plate} - {item.vehicleId?.model}
                </td>
                <td className="border px-2 py-1 min-w-[120px]">{item.description}</td>
                <td className="border px-2 py-1 min-w-[80px] text-right">{item.amount}</td>
              </tr>
            ))}
            <tr>
              <td className="border px-2 py-1 font-bold text-right" colSpan={2}>Total</td>
              <td className="border px-2 py-1 min-w-[80px] text-right font-bold">{formattedAmount}</td>
            </tr>
          </tbody>
        </table>
      

      ) : (
        <table className="w-full border text-xs mb-2 mt-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Description</th>
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
          <tr>
            <td className="border px-2 py-1 font-bold text-right" colSpan={2}>Total</td>
            <td className="border px-2 py-1 min-w-[80px] text-right font-bold">{formattedAmount}</td>
          </tr>
        </tbody>
      </table>
      )}
      
      {/* Amount in words */}
      <div className="text-s text-right mb-1">Amount in words: <span className="font-semibold italic">{birrToWords(amount)}</span></div>
      {/* Requested By and Approved By */}
      <div className=" mt-4 text-xs gap-8">
        <div className=" flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">
           Tigist Worku
          </div>
          <div className='flex justify-between'>

          <h4 className="mt-1">Requested By/ Recipient</h4>
          <h4 className="mt-1">Signature</h4>
          <h4 className="mt-1">Date</h4>
          
          </div>
          
        </div>
        <div className="flex-1" />
        <div className=" flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">
            Biruk Wubshet
          </div>
          <div className='flex justify-between'>
          <h4 className="mt-1">Checked By</h4>

          <h4 className="mt-1">Signature</h4>
          <h4 className="mt-1">Date</h4>
          
          </div>
          
        </div>
        {/* Finance Manager Column */}
        <div className=" flex-1">
          <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">
            Samrawi G/Libanos
          </div>
          <div className='flex justify-between'>
          <h4 className="mt-1">Approved By</h4>

          <h4 className="mt-1">Signature</h4>
          <h4 className="mt-1">Date</h4>
          
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