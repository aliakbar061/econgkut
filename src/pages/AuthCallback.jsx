import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backend-econgkut.vercel.app";
const API = `${BACKEND_URL}/api`;

const AuthCallback = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Login gagal. Silakan coba lagi.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!token) {
        setError('Token tidak ditemukan. Silakan coba lagi.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Verify the token and get user info
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        
        setUser(response.data);
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Gagal memverifikasi sesi. Silakan coba lagi.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-600 text-xl font-semibold mb-2">{error}</div>
            <div className="text-gray-600">Mengalihkan ke halaman utama...</div>
          </>
        ) : (
          <>
            <div className="text-green-600 text-xl font-semibold mb-2">Memproses login...</div>
            <div className="text-gray-600">Mohon tunggu sebentar</div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;