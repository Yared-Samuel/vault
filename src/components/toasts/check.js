import React from 'react';
import { Check } from 'lucide-react';

const CheckButton = ({ onCheck, disabled, ...props }) => (
  <button
    className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 hover:shadow-lg cursor-pointer hover:bg-blue-600 hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed"
    title="Check"
    onClick={onCheck}
    disabled={disabled}
    {...props}
  >
    <Check className="w-4 h-4" />
  </button>
);

export default CheckButton; 