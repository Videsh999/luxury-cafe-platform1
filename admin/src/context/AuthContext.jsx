import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear old localStorage logins
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    const token = sessionStorage.getItem('adminToken');
    const savedAdmin = sessionStorage.getItem('adminUser');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (err) {
        console.error('Session parse error:', err);
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('========== LOGIN START ==========');
    console.log('Email:', email);

    try {
      console.log('STEP 1: About to call backend...');

      const res = await fetch(
        'http://localhost:5001/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      console.log('STEP 2: Fetch completed');
      console.log('Status:', res.status);

      const data = await res.json();

      console.log('STEP 3: Response JSON');
      console.log(data);

      if (res.ok) {
        if (data.role !== 'admin') {
          console.warn('Not an admin account');

          return {
            success: false,
            message: 'Unauthorized: Not an Admin',
          };
        }

        console.log('STEP 4: Saving session');

        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data));

        setAdmin(data);

        console.log('STEP 5: Login Success');

        return {
          success: true,
        };
      }

      console.warn('Backend rejected login');

      return {
        success: false,
        message: data.message || 'Login Failed',
      };
    } catch (err) {
      console.error('========== FETCH ERROR ==========');
      console.error(err);
      console.error('Name:', err.name);
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);

      return {
        success: false,
        message: err.message || 'Network Error',
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};