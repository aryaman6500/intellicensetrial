import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import {useForm } from 'react-hook-form';
import {zodResolver } from '@hookform/resolvers/zod';
import {z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Define validation schema
const questionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  uploadId: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface Upload {
  id: string;
  fileName: string;
  fileType: string;
}

interface Request {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  upload?: {
    id: string;
    fileName: string;
    fileType: string;
  };
}

export const QuestionPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recentQuestions, setRecentQuestions] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    reset,
    formState: { errors } 
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      uploadId: '',
    }
  });
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user's uploads with our fetch-based API client
        const uploadsResponse = await api.get('/upload');
        setUploads(uploadsResponse.data.uploads);
        
        // Fetch recent questions with our fetch-based API client
        const requestsResponse = await api.get('/request');
        setRecentQuestions(requestsResponse.data.requests.slice(0, 5)); // Get only most recent 5
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);
  
  const onSubmit = async (data: QuestionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const requestData = {
        question: data.question,
        uploadId: data.uploadId || undefined,
      };
      
      // Submit question with our fetch-based API client
      const response = await api.post('/request', requestData);
      
      // Add new question to recent questions
      setRecentQuestions([response.data.request, ...recentQuestions.slice(0, 4)]);
      
      // Reset form
      reset();
      
      // Show success message or redirect to request page
    } catch (error: any) {
      console.error('Error submitting question:', error);
      setError(error.message || 'Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container-custom">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Legal Question</h1>
        <p className="text-lg text-gray-600">
          Get answers to your questions about copyright laws, content licensing, and digital rights
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Submit Your Question</h2>
            </div>
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-6">
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Question
                  </label>
                  <textarea
                    id="question"
                    rows={4}
                    className={`input ${errors.question ? 'border-red-500' : ''}`}
                    placeholder="e.g., What are the licensing requirements for using an image from Unsplash on my blog?"
                    {...register('question')}
                  ></textarea>
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="uploadId" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Content (Optional)
                  </label>
                  <select
                    id="uploadId"
                    className="input"
                    {...register('uploadId')}
                  >
                    <option value="">Not related to specific content</option>
                    {uploads.map((upload) => (
                      <option key={upload.id} value={upload.id}>
                        {upload.fileName} ({upload.fileType})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    If your question is about a specific file you've uploaded, select it for more accurate answers.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Question'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Recent Questions */}
        <div>
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Questions</h2>
            </div>
            <div>
              {isLoading ? (
                <div className="p-6 text-center">
                  <svg className="animate-spin h-6 w-6 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : recentQuestions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No questions asked yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentQuestions.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-gray-50">
                      <div className="mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {request.question}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      {request.answer && (
                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {request.answer.length > 100
                            ? `${request.answer.substring(0, 100)}...`
                            : request.answer}
                        </div>
                      )}
                      {request.upload && (
                        <div className="text-xs text-gray-500">
                          Related to: {request.upload.fileName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Common Legal Topics</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Fair Use Doctrine and Limitations</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Copyright Duration and Public Domain</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Creative Commons Licensing</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Commercial vs. Non-Commercial Use</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>DMCA and Takedown Procedures</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 