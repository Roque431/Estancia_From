import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // URL base de la API
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedUserType && savedToken) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
      // Verificar que el token siga siendo válido
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          setUserType(data.data.role);
        } else {
          // Token inválido, limpiar datos
          logout();
        }
      } else {
        // Token inválido, limpiar datos
        logout();
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, type) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { user: loggedInUser, token } = data.data;

        // Verificar que el tipo de usuario coincida
        if (loggedInUser.role !== type) {
          return { 
            success: false, 
            error: 'Tipo de usuario incorrecto. Verifica tu selección.' 
          };
        }

        setUser(loggedInUser);
        setUserType(loggedInUser.role);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("userType", loggedInUser.role);
        localStorage.setItem("token", token);

        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Credenciales incorrectas' 
        };
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      return { 
        success: false, 
        error: 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      setUser(null);
      setUserType(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('token');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  };

  const value = {
    user,
    userType,
    isLoading,
    login,
    logout,
    getAuthHeaders,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isProfesor: user?.role === 'professor',
    isDirector: user?.role === 'director',
    API_BASE_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

