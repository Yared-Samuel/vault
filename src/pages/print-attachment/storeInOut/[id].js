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

// 1. Extract invoice content into a new component
function StoreInOutInvoice({ transaction, company, label, formattedAmount }) {
  return (
    <div className="w-full max-w-xl bg-white p-4 rounded-xl shadow print:shadow-none print:bg-white print:p-0 relative border border-gray-300 text-gray-900 mx-auto mb-10">
      {/* Watermark or label */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0"
        style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          color: 'rgba(156,163,175,0.18)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          rotate: '-45deg',
        }}
      >
        {label}
      </div>
      {/* Header with Logo */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 relative">
            <Image src="/Logo.png" alt="Company Logo" fill style={{objectFit:'contain'}}/>
          </div>
          <div className="text-xl font-extrabold text-gray-700 ml-2">{company.name}</div>
        </div>
      </div>
      <div className="text-center font-bold text-lg underline mb-2 tracking-wide">
        Store In/Out Attachment
        <span className="block text-xs">የስቶር ገቢ ወጪ</span>
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
            <td className="border border-gray-300 font-semibold">Reason(ምክንያት)</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.reason || '-'}</td>
          </tr>
          {transaction.type === "check_payment"  && 
            (<tr>
              <td className="border border-gray-300 font-semibold">Check No ( {transaction.checkRequestId?.bank.toUpperCase()} Bank)</td>
              <td className="border border-gray-300 font-normal bg-gray-100">{transaction.checkRequestId?.checkNumber || '-'}</td>
            </tr>)
          }
          <tr>
            <td className="border border-gray-300 font-semibold">Payment Method</td>
            <td className="border border-gray-300 font-normal bg-gray-100">{transaction.type || '-'}</td>
          </tr>
          {transaction.type === "check_payment" && 
            (<tr>
              <td className="border border-gray-300 font-semibold">Notes</td>
              <td className="border border-gray-300 font-normal bg-gray-100">{transaction.checkRequestId?.notes || '-'}</td>
            </tr>)}
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
              <th className="border px-2 py-1">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {transaction.vehicleMaintenance.map((item) => (
              <tr key={item._id}>
                <td className="border px-2 py-1 min-w-[120px]">
                  {item.vehicleId?.plate} - {item.vehicleId?.model}
                </td>
                <td className="border px-2 py-1 min-w-[120px]">{item.description}</td>
                <td className="border px-2 py-1 min-w-[80px] text-right">{item.qty}</td>
              </tr>
            ))}
            <tr>
              <td className="border px-2 py-1 font-bold text-right" colSpan={2}>Total Quantity</td>
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
              <td className="border px-2 py-1 font-bold text-right" colSpan={2}>Total Quantity</td>
              <td className="border px-2 py-1 min-w-[80px] text-right font-bold">{formattedAmount}</td>
            </tr>
          </tbody>
        </table>
      )}
      <div className="flex flex-col mt-4 text-xs gap-10">
        <div className='flex flex-row gap-5'>
          <div className=" w-full">
            <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">-</div>
            <div className='flex justify-between'>
              <h4 className="mt-1">Delivered By(አስረካቢ)</h4>
              <h4 className="mt-1">Signature(ፊርማ)</h4>
            </div>
          </div>
          <div className="w-full">
            <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">-</div>
            <div className='flex justify-between'>
              <h4 className="mt-1">Recived By(ተረካቢ)</h4>
              <h4 className="mt-1">Signature(ፊርማ)</h4>
            </div>
          </div>
        </div>
        <div className='flex flex-row gap-5'>
          <div className=" w-full">
            <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">-</div>
            <div className='flex justify-between'>
              <h4 className="mt-1">Technichal Approval(ቴክኒካል ማረጋገጫ)</h4>
              <h4 className="mt-1">Signature(ፊርማ)</h4>
            </div>
          </div>
          <div className="w-full">
            <div className="border-b border-gray-400 min-w-[120px] h-6 flex  text-base font-semibold">-</div>
            <div className='flex justify-between'>
              <h4 className="mt-1">Checked By(ያረጋገጠው)</h4>
              <h4 className="mt-1">Signature(ፊርማ)</h4>
            </div>
          </div>
        </div>

      
              
          </div>
    </div>
  );
}

// 2. Main page renders two invoices side by side
export default function PrintInvoicePage() {
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
    phone: '-',
    email: '-',
  };

  // Watermark/label logic
  const label = 'ORIGINAL';

  // Amount
  const quantity = transaction.quantity || 0;
  const formattedAmount = Number(quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col gap-8 justify-center items-center print:gap-0 print:justify-start print:items-start print:w-full print:max-w-full print:p-0">
      <StoreInOutInvoice transaction={transaction} company={company} label={label} formattedAmount={formattedAmount} />
      <StoreInOutInvoice transaction={transaction} company={company} label={label} formattedAmount={formattedAmount} />
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .print\:gap-0 { gap: 0 !important; }
          .print\:w-full { width: 100vw !important; }
          .print\:max-w-full { max-width: 100vw !important; }
          .print\:p-0 { padding: 0 !important; }
          .max-w-xl { max-width: 100% !important; width: 100% !important; }
          .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
          .shadow, .print\:shadow-none { box-shadow: none !important; }
          .print\:a4-fit-vertical {
            height: 48vh !important;
            max-height: 48vh !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
} 