import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../utils/api';

// Define validation schema
const questionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysisId');

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uploadsResponse, requestsResponse] = await Promise.all([
          api.get('/uploads'),
          api.get('/requests'),
        ]);
        setUploads(uploadsResponse.data);
        setRequests(requestsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: QuestionFormData) => {
    try {
      const response = await api.post('/requests', {
        question: data.question,
        analysisId,
      });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (error) {
      console.error('Failed to submit question:', error);
      setError('Failed to submit question. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Ask questions about your content's licensing and copyright status
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Your Question
            </label>
            <textarea
              id="question"
              rows={4}
              {...register('question')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Can I use this content for commercial purposes?"
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </button>
          </div>
        </form>
      </div>

      {requests.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Previous Questions</h2>
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{request.question}</p>
                    {request.upload && (
                      <p className="text-sm text-gray-500">
                        Related to: {request.upload.fileName}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{request.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 