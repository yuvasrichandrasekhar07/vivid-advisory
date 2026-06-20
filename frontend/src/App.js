import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import ServicePopup from './components/ServicePopup';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ListLandPage = lazy(() => import('./pages/ListLandPage'));
const PostRequirementPage = lazy(() => import('./pages/PostRequirementPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const RateCardsPage = lazy(() => import('./pages/RateCardsPage'));
const DosAndDontsPage = lazy(() => import('./pages/DosAndDontsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><LoadingSpinner /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#0D2E5E', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/rate-cards" element={<RateCardsPage />} />
          <Route path="/dos-and-donts" element={<DosAndDontsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard/*" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/list-land" element={<PrivateRoute><ListLandPage /></PrivateRoute>} />
          <Route path="/post-requirement" element={<PrivateRoute><PostRequirementPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ChatbotWidget />
      <ServicePopup />
    </div>
  );
}
