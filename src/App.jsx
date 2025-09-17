import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import ProtectedRoute from './components/organisms/ProtectedRoute';
import Login from './components/organisms/Login';
import EstudianteDashboard from './pages/EstudianteDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import './App.css';

// Componente para redireccionar según el tipo de usuario
const DashboardRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (userType === 'student') {
    return <Navigate to="/estudiante" replace />;
  } else if (userType === 'professor') {
    return <Navigate to="/profesor" replace />;
  } else if (userType === 'director') {
    return <Navigate to="/director" replace />;
  }
  
  return <Login />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal - redirecciona según el tipo de usuario */}
        <Route path="/" element={<DashboardRedirect />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas para estudiantes */}
        <Route 
          path="/estudiante" 
          element={
            <ProtectedRoute requiredUserType="student">
              <EstudianteDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas para profesores */}
        <Route 
          path="/profesor" 
          element={
            <ProtectedRoute requiredUserType="professor">
              <ProfesorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas protegidas para director */}
        <Route 
          path="/director" 
          element={
            <ProtectedRoute requiredUserType="director">
              <DirectorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta catch-all - redirecciona a la página principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;

