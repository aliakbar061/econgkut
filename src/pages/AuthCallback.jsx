import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backend-econgkut.vercel.app";
const API = `${BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session_token from URL params (set by backend redirect)
        const params = new URLSearchParams(window.location.search);
        const sessionToken = params.get('session_token');
        const error = params.get('error');

        if (error) {
          toast.error('Login gagal. Silakan coba lagi.');
          navigate('/');
          return;
        }

        if (!sessionToken) {
          toast.error('Session token tidak ditemukan');
          navigate('/');
          return;
        }

        // Store session token in cookie and get user data
        // The session token is already in the cookie from backend redirect
        // We just need to verify it works
        const response = await axios.get(
          `${API}/auth/me`,
          { 
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            }
          }
        );

        setUser(response.data);
        toast.success('Login berhasil!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Login gagal. Silakan coba lagi.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 text-xl font-semibold">Memproses login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;