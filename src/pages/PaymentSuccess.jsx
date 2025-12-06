import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get(
        `${API}/payments/status/${sessionId}`,
        { withCredentials: true }
      );

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('failed');
        return;
      }

      // Continue polling if still pending
      if (attempts < maxAttempts) {
        setTimeout(() => {
          setAttempts(prev => prev + 1);
          checkPaymentStatus();
        }, 2000);
      } else {
        setStatus('checking');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-green-100 p-8 text-center">
        {status === 'checking' && (
          <div data-testid="payment-checking">
            <Loader2 className="w-20 h-20 text-green-600 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-green-900 mb-3">Memverifikasi Pembayaran...</h2>
            <p className="text-gray-600 mb-6">
              Mohon tunggu sebentar, kami sedang memverifikasi pembayaran Anda.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div data-testid="payment-success">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-3">Pembayaran Berhasil!</h2>
            <p className="text-gray-600 mb-8">
              Terima kasih! Pembayaran Anda telah berhasil diproses. Pemesanan Anda akan segera dikonfirmasi.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/bookings/${bookingId}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl"
                data-testid="view-booking-button"
              >
                Lihat Detail Pemesanan
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full border-green-600 text-green-700 hover:bg-green-50 py-6 rounded-xl"
                data-testid="back-to-dashboard-button"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div data-testid="payment-failed">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-red-900 mb-3">Pembayaran Gagal</h2>
            <p className="text-gray-600 mb-8">
              Maaf, terjadi kesalahan dalam memproses pembayaran Anda. Silakan coba lagi.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/bookings/${bookingId}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl"
                data-testid="retry-payment-button"
              >
                Coba Lagi
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full border-gray-400 text-gray-700 hover:bg-gray-50 py-6 rounded-xl"
                data-testid="back-to-dashboard-button"
              >
                Kembali ke Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;