import React from 'react';
import { Eye } from 'lucide-react';

const ViewMoreButton = ({ onView, disabled, ...props }) => (
  <button
    className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow transition-transform duration-150 hover:scale-110 hover:shadow-lg cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
    title="View Detail"
    onClick={onView}
    disabled={disabled}
    {...props}
  >
    <Eye className="w-4 h-4" />
  </button>
);

export default ViewMoreButton; 