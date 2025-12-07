import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axiosInstance from "@/utils/api";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import BookingForm from "@/pages/BookingForm";
import MyBookings from "@/pages/MyBookings";
import BookingDetail from "@/pages/BookingDetail";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminDashboard from "@/pages/AdminDashboard";
import { Toaster } from "@/components/ui/sonner";

export const AuthContext = React.createContext(null);

// Create axios instance with interceptor for Authorization header
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true
});

// Add Authorization header to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('session_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('No active session');
      // Clear invalid token
      localStorage.removeItem('session_token');
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
      localStorage.removeItem('session_token');
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