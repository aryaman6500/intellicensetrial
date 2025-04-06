import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';

interface Analysis {
  id: string;
  licensingInfo: string;
  licensingSummary: string;
  riskScore: number;
  createdAt: string;
  upload: {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    createdAt: string;
  };
}

export const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First check if the upload exists
        const uploadResponse = await api.get(`/upload/${id}`);
        // @ts-ignore
        const { upload } = uploadResponse.data;

        // Check if analysis exists
        try {
          const analysisResponse = await api.get(`/analysis/${id}`);
          setAnalysis(analysisResponse.data.analysis);
        } catch (error) {
          // If no analysis yet, create one
          setIsAnalyzing(true);

          try {
            await api.post(`/analysis/${id}`, {});
            // Poll for analysis every 2 seconds
            const interval = setInterval(async () => {
              try {
                const response = await api.get(`/analysis/${id}`);
                const data = response.data;

                if (data.analysis) {
                  setAnalysis(data.analysis);
                  setIsAnalyzing(false);
                  clearInterval(interval);
                }
              } catch (error) {
                
              }
            }, 2000);

            
            setTimeout(() => {
              clearInterval(interval);
              if (isAnalyzing) {
                setIsAnalyzing(false);
                setError('Analysis is taking longer than expected. Please try refreshing the page.');
              }
            }, 60000);

            return () => clearInterval(interval);
          } catch (error) {
            setIsAnalyzing(false);
            setError('Failed to start analysis. Please try again.');
          }
        }
      } catch (error: any) {
        console.error('Error fetching analysis:', error);
        setError(error.message || 'Failed to load analysis. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, isAuthenticated, navigate]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    try {
      await api.post('/request', {
        question,
        uploadId: id
      });

      // Navigate to question page
      navigate('/question');
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Failed to submit question. Please try again.');
    }
  };

  // Get risk level label based on score
  const getRiskLevel = (score: number) => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Moderate';
    if (score < 75) return 'High';
    return 'Very High';
  };

  // Get color class based on risk level
  const getRiskColorClass = (score: number) => {
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-custom">
      <div className="mb-8">
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-500 flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Analysis</h1>
        {analysis && (
          <p className="text-lg text-gray-600">
            Analysis for {analysis.upload.fileName}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : isAnalyzing ? (
        <div className="card p-8 text-center">
          <div className="mb-4">
            <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Content</h3>
          <p className="text-gray-600 mb-4">
            Our AI is reviewing your content for copyright and licensing information. This may take a minute or two.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-primary-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-gray-500">Please don't close this window</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Column */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Licensing Analysis</h2>
              </div>
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                    <ReactMarkdown>{analysis.licensingSummary}</ReactMarkdown>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analysis</h3>
                  <div className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-line">
                    <ReactMarkdown>{analysis.licensingInfo}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Ask a Question</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Have a specific question about this content's licensing? Our AI can help answer it.
                </p>
                <div className="flex items-start space-x-4">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="input h-24 resize-none"
                    placeholder="e.g., Can I use this image on my commercial website?"
                  ></textarea>
                  <button
                    onClick={handleAskQuestion}
                    disabled={!question.trim()}
                    className="btn btn-primary flex-shrink-0 mt-1"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Risk Assessment</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Risk Level:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColorClass(analysis.riskScore)}`}>
                    {getRiskLevel(analysis.riskScore)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Low Risk</span>
                    <span>High Risk</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${analysis.riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  This score represents the estimated risk of copyright or licensing issues based on our AI analysis.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Upload Info</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  <strong>File Name:</strong> {analysis.upload.fileName}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>File Type:</strong> {analysis.upload.fileType}
                </p>
                <p className="text-gray-600">
                  <strong>Uploaded On:</strong> {formatDate(analysis.upload.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
