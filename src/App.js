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
    const token = localStorage.getItem('sessionToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ IMPROVED: Response interceptor dengan handling yang lebih baik
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Hanya handle 401 untuk endpoint yang memerlukan auth
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      // ✅ Jangan auto-logout untuk endpoint tertentu atau saat di landing page
      const isAuthEndpoint = requestUrl.includes('/auth/');
      const isPublicEndpoint = requestUrl.includes('/waste-types') || requestUrl.includes('/seed-data');
      const isOnLandingPage = window.location.pathname === '/';
      
      // ✅ Hanya clear session jika bukan di landing page dan bukan endpoint public
      if (!isOnLandingPage && !isPublicEndpoint && !isAuthEndpoint) {
        // Clear auth data
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
        
        // ✅ Tampilkan toast hanya sekali dengan flag
        if (!window.logoutToastShown) {
          window.logoutToastShown = true;
          toast.error('Sesi Anda telah berakhir. Silakan login kembali');
          
          // Redirect ke login setelah delay
          setTimeout(() => {
            window.logoutToastShown = false; // Reset flag
            window.location.href = '/';
          }, 1500);
        }
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
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // ✅ Tambahkan retry logic untuk menghindari false positive
      let retries = 0;
      const maxRetries = 2;
      
      while (retries < maxRetries) {
        try {
          const response = await axiosInstance.get('/auth/me');
          setUser(response.data);
          break; // Success, keluar dari loop
        } catch (error) {
          retries++;
          
          // Jika network error dan masih ada retry, coba lagi
          if (error.code === 'ERR_NETWORK' && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            continue;
          }
          
          // Jika 401 atau sudah max retries, throw error
          throw error;
        }
      }
    } catch (error) {
      console.log('No active session or session expired');
      // ✅ Hanya clear jika benar-benar 401, bukan network error
      if (error.response?.status === 401) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
      }
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
      
      // ✅ Tampilkan toast sukses logout
      toast.success('Berhasil logout');
      
      // Navigate ke landing page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
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