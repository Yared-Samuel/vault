import { useContext, useState, useEffect } from "react";
import AuthContext from "../context/AuthProvider";
import useRedirectLoggedOutUser from "@/lib/redirect";
import { Button } from "@/components/ui/button";
import TransactionRequestform from '@/components/TransactionRequestform';
import { useRouter } from 'next/router';
import { BadgeSecondary } from '@/components/ui/badge';
import { Eye, Check, X } from 'lucide-react';
import TransactionApprove from '@/components/TransactionApprove';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { transactionStatusesModel } from '@/lib/constants';
import React from 'react';
import TransactionDetailModal from '@/components/cash/TransactionDetailModal';
import TransactionTable from '@/components/TransactionTable';
import { RequireRole } from '@/lib/roles';

export default function TransactionsPage() {

  useRedirectLoggedOutUser();
  
  const { auth } = useContext(AuthContext);
  console.log(auth);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    transactionSource: 'cashAccount',
    status: '',
    cashAccount: '',
    checkRequestId: '',
    type: '',
    suspenceAmount: '',
    returnAmount: '',
    date: '',
    pitiCash: false,
    amount: '',
    to: '',
    reason: '',
    relatedReceiptUrl: '',
    approvedBy: '',
    requestedBy: auth?.id || '',
    createdBy: auth?.id || '',
    quantity: '',
  });
  const [checkRequests, setCheckRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('requested');
  const router = useRouter();
  const [cashAccounts, setCashAccounts] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchCheckRequests = async () => {
      try {
        const res = await fetch('/api/checks');
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.filter(
            (cr) => cr.status === 'paid' && cr.type === 'purchase'
          );
          setCheckRequests(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch check requests', err);
      }
    };
    fetchCheckRequests();
  }, []);

  useEffect(() => {
    const fetchCashAccounts = async () => {
      try {
        const res = await fetch('/api/cash');
        const data = await res.json();
        setCashAccounts(data);
      } catch (err) {
        console.error('Failed to fetch cash accounts', err);
      }
    };
    fetchCashAccounts();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
        } else {
          setError(data.message || 'Failed to fetch transactions.');
        }
      } catch (err) {
        setError('Failed to fetch transactions.');
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users/users');
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (data.success) {
          setVehicles(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles', err);
      }
    };
    fetchVehicles();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let newForm = {
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    };

    // Status logic
    if (name === 'transactionSource') {
      if (value === 'cashAccount') {
        newForm.status = newForm.type === 'suspence' ? 'suspence' : 'requested';
        newForm.checkRequestId = '';
      } else if (value === 'checkRequestId') {
        newForm.status = 'paid';
        newForm.cashAccount = '';
      }
    }
    if (name === 'type') {
      if (value === 'suspence') {
        newForm.status = 'suspence';
      } else if (form.transactionSource === 'cashAccount') {
        newForm.status = 'requested';
      }
    }

    setForm(newForm);
  }

  // Accepts an array of entries
  async function handleSubmit(entries, e) {
    e.preventDefault && e.preventDefault();
    setError(null);
    let allSuccess = true;
    let lastError = null;
    for (const form of entries) {
      let payload = {
        status: form.status || 'requested',
        type: form.type,
        reason: form.reason,
        requestedBy: form.requestedBy,
        requestedAt: form.requestedAt,
        createdBy: auth?.id,
      };
      const selectedUser = users.find(u => u._id === form.requestedBy);
      const isTransporter = selectedUser?.role === 'transporter';
      if (isTransporter) {
        payload.vehicleId = form.vehicleId;
      }
      if (form.type === 'receipt_payment') {
        payload.amount = form.amount;
        payload.to = form.to;
        payload.quantity = Number(form.quantity);
        payload.recept_reference = form.recept_reference;
      } else if (form.type === 'suspence_payment') {
        payload.suspenceAmount = form.suspenceAmount;
        payload.quantity = Number(form.quantity);
      }
      // TODO: handle file upload for relatedReceiptFile if needed
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) {
          allSuccess = false;
          lastError = data.message || 'Failed to create transaction.';
        }
      } catch (err) {
        allSuccess = false;
        lastError = 'Failed to create transaction.';
      }
    }
    if (allSuccess) {
      setShowModal(false);
      setForm({
        transactionSource: 'cashAccount',
        status: 'requested',
        cashAccount: '',
        checkRequestId: '',
        type: '',
        suspenceAmount: '',
        returnAmount: '',
        date: '',
        pitiCash: false,
        amount: '',
        to: '',
        reason: '',
        relatedReceiptUrl: '',
        approvedBy: '',
        requestedBy: auth?.id || '',
        createdBy: auth?.id || '',    
        quantity: '',
        recept_reference: '',
      });
      // Refresh transactions
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } else {
      setError(lastError);
    }
  }



  function formatCurrency(amount) {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  function formatRequestedAt(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).replace(/\./g, ''); // Remove dot from short month if present
  }

    return(
      <div className="flex flex-col w-full pt-2">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[#02733E]">Rquests</h1>
        <div className="flex gap-2">
        <Button onClick={() => router.push('/transactions/new')} className="bg-[#02733E] hover:bg-[#038C4C]/80 text-[#EEEFE0] cursor-pointer transition-all duration-200 font-bold text-lg">Make Request</Button>
        <RequireRole roles={["accountant", "admin"]} >
        </RequireRole>
      </div>
      </div>

      {/* Transactions Table/List */}
      <TransactionTable
        transactions={transactions}
        setTransactions={setTransactions}
        filter={filter}
        setFilter={setFilter}
        cashAccounts={cashAccounts}
        formatCurrency={formatCurrency}
        formatRequestedAt={formatRequestedAt}
        setSelectedTransaction={setSelectedTransaction}
        setShowDetailModal={setShowDetailModal}
        auth={auth}
        toast={toast}
        loading={loading}
        error={error}
        transactionStatusesModel={transactionStatusesModel}

      />
      
    {/* Transaction Detail Modal */}
    <TransactionDetailModal
      open={showDetailModal}
      transaction={selectedTransaction}
      onClose={() => setShowDetailModal(false)}
    />
      </div>
  )
} 