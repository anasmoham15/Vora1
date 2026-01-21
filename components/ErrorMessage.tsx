import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-950/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg relative flex items-center shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-sm" role="alert">
        <div className="bg-red-500/20 p-2 rounded-full mr-4">
             <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
        </div>
      <div>
        <strong className="font-bold text-red-400 uppercase tracking-wider text-xs block mb-1">System Error</strong>
        <span className="block text-sm">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;