import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container-custom max-w-lg mx-auto text-center py-16">
      <div className="mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Page Not Found
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link to="/" className="btn btn-primary">
          Go to Homepage
        </Link>
        <Link to="/dashboard" className="btn btn-outline">
          Go to Dashboard
        </Link>
      </div>
      
      <div className="mt-12 border-t border-gray-200 pt-8">
        <p className="text-gray-500">
          If you believe this is an error, please contact our support team.
        </p>
      </div>
    </div>
  );
}; 