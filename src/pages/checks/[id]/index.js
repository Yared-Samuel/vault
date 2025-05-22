import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toWords } from 'number-to-words';

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
function birrToWords(amount) {
  const [birr, cents] = Number(amount).toFixed(2).split('.');
  let words = capitalizeWords(toWords(Number(birr))) + ' Birr';
  if (Number(cents) > 0) {
    words += ' and ' + capitalizeWords(toWords(Number(cents))) + ' Cents';
  }
  words += ' Only';
  return words;
}

export default function CheckDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/checks`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(c => c._id === id);
          setCheck(found);
        } else {
          setError('Check not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading check');
        setLoading(false);
      });
  }, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    setMessage('');
    const res = await fetch('/api/checks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      setCheck(data.data);
      setMessage('Status updated!');
    } else {
      setMessage(data.message || 'Failed to update status');
    }
    setUpdating(false);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error || !check) return <div className="p-8 text-red-600">{error || 'Check not found'}</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Check Detail</h1>
      <div className="border rounded-lg p-4 bg-white shadow">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-lg font-bold">{check.type.charAt(0).toUpperCase() + check.type.slice(1)} Check</span>
          <span className="text-gray-500 text-sm">{check.issuedAt ? new Date(check.issuedAt).toLocaleDateString() : '-'}</span>
        </div>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">Bank: <span className="font-semibold">{check.bank ? check.bank.charAt(0).toUpperCase() + check.bank.slice(1) : '-'}</span></span>
          <span className="text-sm text-gray-600">Check Number: <span className="font-semibold">{check.checkNumber || '-'}</span></span>
        </div>
        <div className="mb-2 flex flex-row flex-wrap justify-between items-center border border-dashed border-gray-400 rounded px-3 py-2 bg-gray-50">
          <span className="text-xs italic text-gray-700 font-semibold text-left max-w-[60%] break-words">{check.amount ? birrToWords(check.amount) : ''}</span>
          <span className="text-1xl font-bold text-green-700 tracking-wider">{Number(check.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} Birr</span>
        </div>
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">For: <span className="font-semibold">{check.notes || '-'}</span></span>
          <span className="text-xs text-gray-500">Prepared By: <span className="font-semibold text-gray-700">{check.requestedBy?.name || '-'}</span></span>
        </div>
        <div className="mb-4 flex flex-row items-center gap-2 text-xs text-gray-500">
          <span>Type: <span className="font-semibold text-gray-700">{check.type.charAt(0).toUpperCase() + check.type.slice(1)}</span></span>
          <span>|</span>
          <span>Status: <span className="font-semibold text-gray-700">{check.status.charAt(0).toUpperCase() + check.status.slice(1)}</span></span>
        </div>
        {message && <div className="mb-2 text-green-600 text-xs">{message}</div>}
        <div className="flex gap-2 mt-2">
          {check.status === 'pending' && (
            <>
              <button className="w-24 text-center text-xs font-bold py-2 rounded-full border border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('approved')}>Approve</button>
              <button className="w-20 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('paid')}>Pay</button>
              <button className="w-24 text-center text-xs font-bold py-2 rounded-full border border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('rejected')}>Reject</button>
            </>
          )}
          {check.status === 'approved' && (
            <>
              <button className="w-20 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('paid')}>Pay</button>
              <button className="w-24 text-center text-xs font-bold py-2 rounded-full border border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('rejected')}>Reject</button>
            </>
          )}
          {check.status === 'rejected' && (
            <button className="w-24 text-center text-xs font-bold py-2 rounded-full border border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 transition-colors cursor-pointer" disabled={updating} onClick={() => handleStatusChange('pending')}>Appeal</button>
          )}
          {check.status === 'paid' && (
            <span className="w-40 text-center text-xs font-bold py-2 rounded-full border border-blue-500 text-blue-700 bg-blue-50" style={{ display: 'inline-block' }}>Paid</span>
          )}
        </div>
      </div>
    </div>
  );
} 