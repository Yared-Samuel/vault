import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const PaymentReportPrint = () => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const storedData = localStorage.getItem('queryParams');
        if (storedData) {
            setReportData(JSON.parse(storedData));
            setTimeout(() => window.print(), 500);
        }
    }, []);

    if (!reportData) {
        return <div className="p-10 text-center">Loading report data or no data provided...</div>;
    }

    const { transactions, startDate, endDate } = reportData;

    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || tx.suspenceAmount || 0), 0);

    const serialNumbers = transactions.map(tx => tx.serialNumber).filter(Boolean);
    const minSerial = serialNumbers.length > 0 ? Math.min(...serialNumbers) : 'N/A';
    const maxSerial = serialNumbers.length > 0 ? Math.max(...serialNumbers) : 'N/A';
    const serialRange = minSerial !== 'N/A' ? `${minSerial} - ${maxSerial}` : 'Not Applicable';

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== "number") return "-";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
        }).format(amount);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800 bg-white">
            <header className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-18 h-18 relative">
                        <Image src="/Logo.png" alt="Company Logo" fill className="object-contain" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">Girma Gifawoosen Trading</div>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p><strong>Report Generated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>{new Date().toLocaleTimeString()}</p>
                </div>
            </header>

            <main>
                <div className="text-center my-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
                        Financial Payment Report
                    </h1>
                    <p className="text-gray-700 text-lg">
                        <strong>Reporting Period:</strong> {startDate ? formatDate(startDate) : 'N/A'} to {endDate ? formatDate(endDate) : 'N/A'}
                    </p>
                </div>

                <div className="flex justify-around gap-4 mb-8 py-4 border-y-2 border-gray-200">
                    <div className="text-center">
                        <h3 className="text-base text-gray-600 mb-1">Total Payment Amount</h3>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-base text-gray-600 mb-1">Payment Count</h3>
                        <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-base text-gray-600 mb-1">CPV Number Range</h3>
                        <p className="text-2xl font-bold text-gray-800">{serialRange}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                    Detailed Transactions
                </h2>

                <table className="w-full border-collapse text-sm table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 border border-gray-300 text-left font-semibold w-1/5">Payee/To</th>
                            <th className="p-2 border border-gray-300 text-left font-semibold w-1/4">Reason</th>
                            <th className="p-2 border border-gray-300 text-left font-semibold">CPV No</th>
                            <th className="p-2 border border-gray-300 text-left font-semibold">Date</th>
                            <th className="p-2 border border-gray-300 text-left font-semibold">Reference</th>
                            <th className="p-2 border border-gray-300 text-right font-semibold">Amount</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, idx) => (
                            <tr key={tx._id || idx} className="odd:bg-white even:bg-gray-50">
                                <td className="p-2 border border-gray-300">{tx.to || '-'}</td>
                                <td className="p-2 border border-gray-300">{tx.reason || '-'}</td>
                                <td className="p-2 border border-gray-300">{tx.serialNumber || '-'}</td>
                                <td className="p-2 border border-gray-300">{formatDate(tx.requestedAt)}</td>
                                <td className="p-2 border border-gray-300 break-all whitespace-pre-line">{tx.recept_reference || '-'}</td>
                                <td className="p-2 border border-gray-300 text-right font-bold">{formatCurrency(tx.amount || tx.suspenceAmount)}</td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
                        <div className="w-full p-2 border border-gray-300 text-right font-bold flex justify-between">
                            <div>Grand Total</div>
                            <div className="p-2 border  text-right font-bold">
                                 {formatCurrency(totalAmount)}
                            </div>
                        </div>
            </main>

            <footer className="mt-12 pt-6 border-t border-gray-300 flex justify-between gap-8">
                <div className="flex-1 text-center">
                    <div className="font-semibold mb-12">Prepared By</div>
                    <div className="border-b border-gray-400 mb-2"></div>
                    <div className="text-gray-500 text-sm">Name & Signature</div>
                </div>
                <div className="flex-1 text-center">
                    <div className="font-semibold mb-12">Checked By</div>
                    <div className="border-b border-gray-400 mb-2"></div>
                    <div className="text-gray-500 text-sm">Name & Signature</div>
                </div>
                <div className="flex-1 text-center">
                    <div className="font-semibold mb-12">Approved By</div>
                    <div className="border-b border-gray-400 mb-2"></div>
                    <div className="text-gray-500 text-sm">Name & Signature</div>
                </div>
            </footer>
        </div>
    );
};

export default PaymentReportPrint;