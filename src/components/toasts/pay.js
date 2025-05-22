import React from 'react';

const PayButton = ({ onPay, disabled, ...props }) => (
  <button
    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-full font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
    title="Pay"
    onClick={onPay}
    disabled={disabled}
    {...props}
  >
    Pay
  </button>
);

export default PayButton; 