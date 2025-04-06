import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { ArrowRight, Shield, FileText, MessageSquare, Upload, CheckCircle} from 'lucide-react';

export const HomePage: React.FC = () => {
  // @ts-ignore
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-blue-700 mb-4">
              <span className="text-sm font-medium">AI-Powered Content Protection</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Protect Your Digital <span className="text-blue-700">Content</span> With Confidence
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl">
              Intellicense helps creators, businesses, and legal teams verify copyright, 
              licensing, and compliance for digital assets with advanced AI analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="btn flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all">
                    Upload Content <Upload size={18} />
                  </Link>
                  <Link to="/dashboard" className="btn flex items-center justify-center gap-2 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg transition-all">
                    My Dashboard <ArrowRight size={18} />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-blue-700 hover:text-blue-700 px-8 py-3 rounded-lg font-medium text-lg transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-500">
  <CheckCircle size={16} className="text-green-500" />
  <span>Quick setup</span>
  <span className="mx-2">•</span>
  <CheckCircle size={16} className="text-green-500" />
  <span>No strings attached</span>
  <span className="mx-2">•</span>
  <CheckCircle size={16} className="text-green-500" />
  <span>Join for free</span>
</div>

          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                <svg className="w-64 h-64 text-blue-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v5.703l-4.311-1.58a2 2 0 0 0-1.377 0l-5 1.832A2 2 0 0 0 8 11.861c.03 2.134.582 4.228 1.607 6.106.848 1.555 2 2.924 3.382 4.033H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z" clipRule="evenodd"/>
                  <path fillRule="evenodd" d="M15.345 9.061a1 1 0 0 0-.689 0l-5 1.833a1 1 0 0 0-.656.953c.028 1.97.538 3.905 1.485 5.641a12.425 12.425 0 0 0 3.956 4.34 1 1 0 0 0 1.12 0 12.426 12.426 0 0 0 3.954-4.34A12.14 12.14 0 0 0 21 11.848a1 1 0 0 0-.656-.954l-5-1.833ZM15 19.765a10.401 10.401 0 0 0 2.76-3.235 10.15 10.15 0 0 0 1.206-4.011L15 11.065v8.7Z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-blue-700 mb-4">
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Content Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides advanced tools to ensure your digital content 
              complies with copyright laws and licensing requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Licensing Check</h3>
              <p className="text-gray-600 mb-4">
                Our advanced AI system fetches and analyzes relevant copyright and licensing information 
                from multiple sources to ensure your content is compliant.
              </p>
              <div className="flex items-center mt-auto text-blue-700 font-medium">
                <span>Learn more</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Simplified Summaries</h3>
              <p className="text-gray-600 mb-4">
                Get complex licensing terms explained in plain language, making legal jargon 
                easily understandable for non-legal professionals.
              </p>
              <div className="flex items-center mt-auto text-blue-700 font-medium">
                <span>Learn more</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Legal Q&A Chatbot</h3>
              <p className="text-gray-600 mb-4">
                Ask questions about copyright laws and get instant, accurate responses 
                from our AI-powered legal assistant tailored to your specific content.
              </p>
              <div className="flex items-center mt-auto text-blue-700 font-medium">
                <span>Learn more</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-blue-700 mb-4">
              <span className="text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How DigitalRightsGuard Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've simplified the process of checking content compliance in just a few steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Upload className="h-8 w-8 text-blue-700" />,
                title: "Upload Content",
                description: "Upload your image, article, or video for comprehensive AI analysis"
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-700" />,
                title: "AI Analysis",
                description: "Our AI analyzes content for copyright and licensing information from multiple sources"
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-blue-700" />,
                title: "Get Results",
                description: "Receive detailed reports with licensing information and compliance risk score"
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-blue-700" />,
                title: "Ask Questions",
                description: "Get answers to specific legal questions about your content's compliance"
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="absolute -top-4 -left-4 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/register" className="btn bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium">
              Start Protecting Your Content
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 DigitalRightsGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
