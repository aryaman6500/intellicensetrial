import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Define validation schema
const uploadSchema = z.object({
  fileType: z.enum(['IMAGE', 'ARTICLE', 'VIDEO'], {
    errorMap: () => ({ message: 'Please select a valid file type' })
  }),
  contentType: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export const UploadPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    watch,
    formState: { errors } 
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    mode: 'onChange',
    defaultValues: {
      fileType: 'IMAGE'
    }
  });
  
  const fileType = watch('fileType');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      console.log('Starting file upload...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', data.fileType);
      if (data.contentType) {
        formData.append('contentType', data.contentType);
      }
      
      console.log('Uploading file...');
      //@ts-ignore
      const uploadResponse = await api.post('/upload', formData, {
        onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
          setUploadProgress(progress);
        },
      });

      console.log('File upload complete, starting analysis...');
      console.log('Upload response:', uploadResponse);
      
      // Fix: Extract upload ID from the response
      const uploadId = uploadResponse.data.upload.id;
      console.log('Upload ID:', uploadId);
      
      if (!uploadId) {
        console.error('Invalid upload response:', uploadResponse);
        throw new Error('Invalid upload response: missing upload ID');
      }

      console.log('Making analysis request for upload ID:', uploadId);
      await api.post(`/analysis/${uploadId}`, {});
      console.log('Analysis request sent');
      
      navigate(`/analysis/${uploadId}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="container-custom max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
        <p className="text-lg text-gray-600">
          Upload your content for copyright and licensing analysis
        </p>
      </div>
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading file... {uploadProgress}%</span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <label className={`
                border rounded-lg p-4 flex flex-col items-center cursor-pointer
                ${fileType === 'IMAGE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  value="IMAGE"
                  className="sr-only"
                  {...register('fileType')}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 ${fileType === 'IMAGE' ? 'text-primary-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={fileType === 'IMAGE' ? 'text-primary-700 font-medium' : 'text-gray-700'}>Image</span>
              </label>
              
              <label className={`
                border rounded-lg p-4 flex flex-col items-center cursor-pointer
                ${fileType === 'ARTICLE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  value="ARTICLE"
                  className="sr-only"
                  {...register('fileType')}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 ${fileType === 'ARTICLE' ? 'text-primary-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className={fileType === 'ARTICLE' ? 'text-primary-700 font-medium' : 'text-gray-700'}>Article</span>
              </label>
              
              <label className={`
                border rounded-lg p-4 flex flex-col items-center cursor-pointer
                ${fileType === 'VIDEO' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                <input
                  type="radio"
                  value="VIDEO"
                  className="sr-only"
                  {...register('fileType')}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 mb-2 ${fileType === 'VIDEO' ? 'text-primary-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className={fileType === 'VIDEO' ? 'text-primary-700 font-medium' : 'text-gray-700'}>Video</span>
              </label>
            </div>
            {errors.fileType && (
              <p className="mt-1 text-sm text-red-600">{errors.fileType.message}</p>
            )}
          </div>
          
          {fileType === 'ARTICLE' && (
            <div className="mb-6">
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
                Article Type (Optional)
              </label>
              <select
                id="contentType"
                className="input"
                {...register('contentType')}
              >
                <option value="">Select an article type</option>
                <option value="blog">Blog Post</option>
                <option value="news">News Article</option>
                <option value="academic">Academic Paper</option>
                <option value="marketing">Marketing Content</option>
                <option value="other">Other</option>
              </select>
              {errors.contentType && (
                <p className="mt-1 text-sm text-red-600">{errors.contentType.message}</p>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File
            </label>
            
            <div
              className={`
                border-2 border-dashed rounded-lg p-6
                ${selectedFile ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
                transition-colors duration-200 ease-in-out
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    Drag and drop your file here, or
                    <label htmlFor="file-upload" className="ml-1 font-medium text-primary-600 hover:text-primary-500 cursor-pointer">
                      browse
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {fileType === 'IMAGE' && 'PNG, JPG, GIF up to 10MB'}
                    {fileType === 'ARTICLE' && 'PDF, DOC, TXT up to 10MB'}
                    {fileType === 'VIDEO' && 'MP4, MOV, AVI up to 100MB'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {fileType === 'IMAGE' && (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded mr-4"
                      />
                    )}
                    {fileType === 'ARTICLE' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {fileType === 'VIDEO' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-500"
                    onClick={handleRemoveFile}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading {uploadProgress}%
                </div>
              ) : (
                'Upload and Analyze'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 