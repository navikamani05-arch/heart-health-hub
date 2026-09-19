import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Guards & Layouts
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AppLayout } from './components/AppLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Pages (Existing)
import { Home as Dashboard } from './pages/Home';
import { Predictor } from './pages/Predictor';
import { History } from './pages/History';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';
import { ModelInsights } from './pages/ModelInsights';
import { CardiacCare } from './pages/CardiacCare';
import { WellnessCoach } from './pages/WellnessCoach';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { loading } = useLanguage();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>🫀</span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Loading Heart Health Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Protected Routes (wrapped in AppLayout) */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/risk-predictor" element={<ProtectedRoute><AppLayout><Predictor /></AppLayout></ProtectedRoute>} />
      <Route path="/wellness-coach" element={<ProtectedRoute><AppLayout><WellnessCoach /></AppLayout></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><AppLayout><ModelInsights /></AppLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><AppLayout><History /></AppLayout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><AppLayout><Goals /></AppLayout></ProtectedRoute>} />
      <Route path="/care" element={<ProtectedRoute><AppLayout><CardiacCare /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="/model-insights" element={<Navigate to="/insights" replace />} />
      <Route path="/health-goals" element={<Navigate to="/goals" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

