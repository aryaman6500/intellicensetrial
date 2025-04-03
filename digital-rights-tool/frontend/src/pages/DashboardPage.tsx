import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

interface Upload {
  id: string;
  fileName: string;
  fileType: 'IMAGE' | 'ARTICLE' | 'VIDEO';
  createdAt: string;
  analysis?: {
    id: string;
    licensingSummary?: string;
    riskScore?: number;
    createdAt: string;
  };
}

interface Request {
  id: string;
  question: string;
  answer?: string;
  createdAt: string;
  upload?: {
    id: string;
    fileName: string;
    fileType: string;
  };
}

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch uploads - token will be added automatically by our API interceptor
        const uploadsResponse = await api.get('/upload');
        setUploads(uploadsResponse.data.uploads);

        // Fetch requests - token will be added automatically by our API interceptor
        const requestsResponse = await api.get('/request');
        setRequests(requestsResponse.data.requests);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user, navigate]);

  // Get risk level label based on score
  const getRiskLevel = (score?: number) => {
    if (score === undefined) return 'Unknown';
    if (score < 25) return 'Low';
    if (score < 50) return 'Moderate';
    if (score < 75) return 'High';
    return 'Very High';
  };

  // Get color class based on risk level
  const getRiskColorClass = (score?: number) => {
    if (score === undefined) return 'bg-gray-200';
    if (score < 25) return 'bg-green-100 text-green-800';
    if (score < 50) return 'bg-yellow-100 text-yellow-800';
    if (score < 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon for file type
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'ARTICLE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'VIDEO':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="container-custom">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome back, {user?.name || user?.email?.split('@')[0]}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Uploads */}
          <div className="card">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Uploads</h2>
              <Link to="/upload" className="btn btn-primary text-sm px-4 py-2">
                Upload New
              </Link>
            </div>
            
            <div className="divide-y divide-gray-200">
              {uploads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2">No uploads yet</p>
                  <Link to="/upload" className="text-primary-600 hover:text-primary-500">
                    Upload your first content
                  </Link>
                </div>
              ) : (
                uploads.slice(0, 5).map((upload) => (
                  <div key={upload.id} className="p-4 hover:bg-gray-50">
                    <Link to={`/analysis/${upload.id}`} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getFileTypeIcon(upload.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {formatDate(upload.createdAt)}
                        </p>
                        {upload.analysis && (
                          <div className="mt-2 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColorClass(upload.analysis.riskScore)}`}>
                              {getRiskLevel(upload.analysis.riskScore)} Risk
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
            
            {uploads.length > 5 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link to="/uploads" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View all uploads
                </Link>
              </div>
            )}
          </div>

          {/* Recent Questions */}
          <div className="card">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Questions</h2>
              <Link to="/question" className="btn btn-primary text-sm px-4 py-2">
                Ask a Question
              </Link>
            </div>
            
            <div className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mb-2">No questions asked yet</p>
                  <Link to="/question" className="text-primary-600 hover:text-primary-500">
                    Ask your first question
                  </Link>
                </div>
              ) : (
                requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    <Link to={`/question/${request.id}`} className="block">
                      <div className="mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {request.question}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Asked on {formatDate(request.createdAt)}
                        </p>
                      </div>
                      {request.answer && (
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {request.answer.length > 100
                            ? `${request.answer.substring(0, 100)}...`
                            : request.answer}
                        </div>
                      )}
                      {request.upload && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          {getFileTypeIcon(request.upload.fileType)}
                          <span className="ml-1">Related to: {request.upload.fileName}</span>
                        </div>
                      )}
                    </Link>
                  </div>
                ))
              )}
            </div>
            
            {requests.length > 5 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link to="/questions" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View all questions
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 