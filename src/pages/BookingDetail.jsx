import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, MapPin, Calendar, Clock, Weight, Package, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const BookingDetail = () => {
  const { user, axiosInstance } = useContext(AuthContext); // ✅ Ambil axiosInstance dari context
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    // ✅ Check auth first
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/');
      return;
    }
    
    fetchBooking();
  }, [id, user, navigate]);

  const fetchBooking = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`); // ✅ Gunakan axiosInstance
      setBooking(response.data);
    } catch (error) {
      console.error('Fetch booking error:', error);
      
      // ✅ Handle different error cases
      if (error.response?.status === 404) {
        toast.error('Pemesanan tidak ditemukan');
      } else if (error.response?.status !== 401) {
        // 401 sudah di-handle oleh interceptor
        toast.error('Gagal memuat detail pemesanan');
      }
      
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await axiosInstance.post('/payments/checkout', { // ✅ Gunakan axiosInstance
        booking_id: booking.id,
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.detail || 'Gagal membuat sesi pembayaran');
      }
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
      'in-transit': 'bg-purple-100 text-purple-700 border-purple-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      'in-transit': 'Truk Dalam Perjalanan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case 'in-transit':
        return <Truck className="w-16 h-16 text-purple-500" />;
      case 'confirmed':
        return <CheckCircle2 className="w-16 h-16 text-blue-500" />;
      default:
        return <Package className="w-16 h-16 text-yellow-500" />;
    }
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-green-600 text-xl font-semibold">Memuat...</div>
      </div>
    );
  }

  // ✅ Handle case when booking is null after loading
  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Pemesanan tidak ditemukan</p>
          <Button onClick={() => navigate('/bookings')} className="bg-green-600 hover:bg-green-700">
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/bookings')}
                className="text-green-700"
                data-testid="back-to-bookings-button"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Riwayat
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-green-800">EcoCollect</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-6 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-6">
            {getStatusIcon(booking.status)}
            <h2 className="text-3xl font-bold text-green-900 mt-4 mb-2">Detail Pemesanan</h2>
            <span className={`px-6 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>

          {/* Booking Details */}
          <div className="space-y-6 mt-8">
            {/* Waste Type */}
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="waste-type-info">
              <Package className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Jenis Sampah</p>
                <p className="text-lg font-semibold text-green-900">{booking.waste_type_name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Kategori: {booking.waste_category === 'organic' ? 'Organik' : 'Non-Organik'}
                </p>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="pickup-address-info">
              <MapPin className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Alamat Pengambilan</p>
                <p className="text-lg font-semibold text-green-900">{booking.pickup_address}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="pickup-date-info">
                <Calendar className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                  <p className="text-lg font-semibold text-green-900">{booking.pickup_date}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="pickup-time-info">
                <Clock className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Waktu</p>
                  <p className="text-lg font-semibold text-green-900">{booking.pickup_time}</p>
                </div>
              </div>
            </div>

            {/* Weight & Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="estimated-weight-info">
                <Weight className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Estimasi Berat</p>
                  <p className="text-lg font-semibold text-green-900">{booking.estimated_weight} kg</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl" data-testid="estimated-price-info">
                <CreditCard className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Estimasi Biaya</p>
                  <p className="text-2xl font-bold text-green-600">${booking.estimated_price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="p-4 bg-gray-50 rounded-xl" data-testid="booking-notes">
                <p className="text-sm text-gray-600 mb-1">Catatan</p>
                <p className="text-gray-800">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Status Pembayaran:</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                booking.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-orange-100 text-orange-700 border border-orange-300'
              }`} data-testid="payment-status">
                {booking.payment_status === 'paid' ? '✅ Sudah Dibayar' : '⏳ Belum Dibayar'}
              </span>
            </div>

            {/* Payment Button */}
            {booking.payment_status !== 'paid' && booking.status !== 'cancelled' && (
              <Button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl"
                data-testid="pay-now-button"
              >
                {paymentLoading ? 'Memproses...' : `Bayar Sekarang - $${booking.estimated_price.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <h3 className="text-2xl font-bold text-green-900 mb-6">Status Tracking</h3>
          <div className="space-y-4">
            <div className={`flex items-start space-x-4 ${['pending', 'confirmed', 'in-transit', 'completed'].includes(booking.status) ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ['pending', 'confirmed', 'in-transit', 'completed'].includes(booking.status)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pemesanan Dibuat</p>
                <p className="text-sm text-gray-500">Pemesanan Anda telah diterima</p>
              </div>
            </div>

            <div className={`flex items-start space-x-4 ${['confirmed', 'in-transit', 'completed'].includes(booking.status) ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ['confirmed', 'in-transit', 'completed'].includes(booking.status)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dikonfirmasi</p>
                <p className="text-sm text-gray-500">Pemesanan telah dikonfirmasi</p>
              </div>
            </div>

            <div className={`flex items-start space-x-4 ${['in-transit', 'completed'].includes(booking.status) ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ['in-transit', 'completed'].includes(booking.status)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dalam Perjalanan</p>
                <p className="text-sm text-gray-500">Truk sedang menuju lokasi Anda</p>
              </div>
            </div>

            <div className={`flex items-start space-x-4 ${booking.status === 'completed' ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                booking.status === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                ✓
              </div>
              <div>
                <p className="font-semibold text-gray-900">Selesai</p>
                <p className="text-sm text-gray-500">Sampah telah diambil</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;