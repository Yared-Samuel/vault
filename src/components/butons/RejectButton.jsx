import React from 'react';
import { X } from 'lucide-react';

const RejectButton = ({ onReject, disabled, ...props }) => (
  <button
    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 hover:shadow-lg cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
    title="Reject"
    onClick={onReject}
    disabled={disabled}
    {...props}
  >
    <X className="w-4 h-4" />
  </button>
);

export default RejectButton; 