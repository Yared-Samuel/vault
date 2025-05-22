import React from 'react';

const ApproveButton = ({ onApprove, disabled, ...props }) => (
  <button
    className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-1.5 rounded-full font-semibold shadow hover:from-green-600 hover:to-green-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
    title="Approve"
    onClick={onApprove}
    disabled={disabled}
    {...props}
  >
    Approve
  </button>
);

export default ApproveButton; 