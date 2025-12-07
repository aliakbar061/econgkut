import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import BookingForm from "@/pages/BookingForm";
import MyBookings from "@/pages/MyBookings";
import BookingDetail from "@/pages/BookingDetail";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminDashboard from "@/pages/AdminDashboard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext(null);

// ✅ Create axios instance with interceptor for Authorization header
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true
});

// ✅ Add Authorization header to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sessionToken'); // ✅ Konsisten dengan backend response
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Add response interceptor to handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      
      // Show toast only if not already on login page
      if (window.location.pathname !== '/') {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali');
        
        // Redirect to login after short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Export axios instance
export { axiosInstance };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('sessionToken'); // ✅ Konsisten
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('No active session');
      // Clear invalid token
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-green-600 text-xl font-semibold">Memuat...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, axiosInstance }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/new-booking" element={user ? <BookingForm /> : <Navigate to="/" />} />
            <Route path="/bookings" element={user ? <MyBookings /> : <Navigate to="/" />} />
            <Route path="/bookings/:id" element={user ? <BookingDetail /> : <Navigate to="/" />} />
            <Route path="/payment-success" element={user ? <PaymentSuccess /> : <Navigate to="/" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </AuthContext.Provider>
  );
}

export default App;