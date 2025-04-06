import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayText, setDisplayText] = useState("IntelliCense");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const words = ["IntelliCense"];
  
  useEffect(() => {
    const ticker = setTimeout(() => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setDisplayText(
        isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
      );

      if (isDeleting) {
        setTypingSpeed(80);
      } else {
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
        setTypingSpeed(150);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(150);
      }
    }, typingSpeed);

    return () => clearTimeout(ticker);
  }, [displayText, isDeleting, loopNum, typingSpeed, words]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-300 text-gray-900">
      <nav className="bg-black text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold flex items-center">
            
            <svg className="w-10 h-10 text-gray-800 dark:text-white mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v5.703l-4.311-1.58a2 2 0 0 0-1.377 0l-5 1.832A2 2 0 0 0 8 11.861c.03 2.134.582 4.228 1.607 6.106.848 1.555 2 2.924 3.382 4.033H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M15.345 9.061a1 1 0 0 0-.689 0l-5 1.833a1 1 0 0 0-.656.953c.028 1.97.538 3.905 1.485 5.641a12.425 12.425 0 0 0 3.956 4.34 1 1 0 0 0 1.12 0 12.426 12.426 0 0 0 3.954-4.34A12.14 12.14 0 0 0 21 11.848a1 1 0 0 0-.656-.954l-5-1.833ZM15 19.765a10.401 10.401 0 0 0 2.76-3.235 10.15 10.15 0 0 0 1.206-4.011L15 11.065v8.7Z" clipRule="evenodd"/>
            </svg>
            
            <div className="text-white flex items-center">
              <span>{displayText.split('Cense')[0]}</span>
              <span className="text-white">
                {displayText.includes('Cense') ? 'Cense' : 
                 displayText.includes('Sense') ? 'Sense' : 
                 displayText.includes('License') ? 'License' : ''}
              </span>
              <span className="animate-pulse ml-1 border-r-2 border-blue-200 h-8"></span>
            </div>
          </Link>
          
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-blue-100 hover:text-white transition-colors">Dashboard</Link>
                <Link to="/upload" className="text-blue-100 hover:text-white transition-colors">Upload</Link>
                <Link to="/question" className="text-blue-100 hover:text-white transition-colors">Ask a Question</Link>
                <div className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center hover:text-gray-200"
                  >
                    <span className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 shadow-inner">
                      {(user?.name?.[0] || user?.email?.[0] || '?').toUpperCase()}
                    </span>
                    <span>{user?.name || user?.email}</span>
                    <svg className="w-5 h-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 z-10">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-100 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-700 pb-4 px-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-blue-100 hover:text-white">Dashboard</Link>
                <Link to="/upload" className="block py-2 text-blue-100 hover:text-white">Upload</Link>
                <Link to="/question" className="block py-2 text-blue-100 hover:text-white">Ask a Question</Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-2 text-red-300 hover:text-red-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-blue-100 hover:text-white">Sign in</Link>
                <Link to="/register" className="block py-2 text-blue-100 hover:text-white">Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>


      <main className="flex-grow container mx-auto py-8 px-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <svg className="w-6 h-6 text-gray-800 dark:text-white mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v5.703l-4.311-1.58a2 2 0 0 0-1.377 0l-5 1.832A2 2 0 0 0 8 11.861c.03 2.134.582 4.228 1.607 6.106.848 1.555 2 2.924 3.382 4.033H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M15.345 9.061a1 1 0 0 0-.689 0l-5 1.833a1 1 0 0 0-.656.953c.028 1.97.538 3.905 1.485 5.641a12.425 12.425 0 0 0 3.956 4.34 1 1 0 0 0 1.12 0 12.426 12.426 0 0 0 3.954-4.34A12.14 12.14 0 0 0 21 11.848a1 1 0 0 0-.656-.954l-5-1.833ZM15 19.765a10.401 10.401 0 0 0 2.76-3.235 10.15 10.15 0 0 0 1.206-4.011L15 11.065v8.7Z" clipRule="evenodd"/>
              </svg>
              {displayText}
            </h3>
            <p>AI-powered digital rights and content licensing compliance tool.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/upload" className="text-gray-400 hover:text-white transition-colors">Upload</Link></li>
              <li><Link to="/question" className="text-gray-400 hover:text-white transition-colors">Ask a Question</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center">
          &copy; {new Date().getFullYear()} IntelliCense. All rights reserved.
        </div>
      </footer>
    </div>
  );
}; 