import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  UploadPage,
  AnalysisPage,
  QuestionPage,
  NotFoundPage
} from './pages';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="analysis/:id" element={<AnalysisPage />} />
            <Route path="question" element={<QuestionPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App; 