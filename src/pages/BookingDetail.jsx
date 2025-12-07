import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, MapPin, Calendar, Clock, Weight, Package, CreditCard, CheckCircle2, Wallet, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

const BookingDetail = () => {
  const { user, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/');
      return;
    }
    
    fetchBooking();
  }, [id, user, navigate]);

  const fetchBooking = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Fetch booking error:', error);
      
      if (error.response?.status === 404) {
        toast.error('Pemesanan tidak ditemukan');
      } else if (error.response?.status !== 401) {
        toast.error('Gagal memuat detail pemesanan');
      }
      
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDeleteBooking = async () => {
    setDeleteLoading(true);
    setShowDeleteDialog(false);
    
    try {
      await axiosInstance.delete(`/bookings/${booking.id}`);
      toast.success('Pemesanan berhasil dihapus');
      
      setTimeout(() => {
        navigate('/bookings');
      }, 1000);
    } catch (error) {
      console.error('Delete booking error:', error);
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.detail || 'Hanya pemesanan dengan status "Menunggu" atau "Dibatalkan" yang dapat dihapus');
      } else if (error.response?.status !== 401) {
        toast.error('Gagal menghapus pemesanan');
      }
    } finally {
      setDeleteLoading(false);
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

  const displayPaymentStatus = () => {
    if (booking.status === 'completed') {
      return 'paid';
    }
    return booking.payment_status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-green-600 text-xl font-semibold">Memuat...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Pemesanan tidak ditemukan</p>
          <Button onClick={() => navigate('/bookings')} className="bg-green-600 hover:bg-green-700">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const currentPaymentStatus = displayPaymentStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Apakah Anda yakin ingin menghapus pemesanan ini?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Batal
              </Button>
              <Button
                onClick={handleDeleteBooking}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

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
                Kembali
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-green-800">ECOngkut</span>
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
                  <p className="text-2xl font-bold text-green-600">{formatRupiah(booking.estimated_price)}</p>
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

          {/* Payment Info & Action */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Payment Method Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Metode Pembayaran</p>
                  <p className="text-sm text-blue-700">
                    Pembayaran dilakukan secara <strong>tunai (cash)</strong> setelah sampah diambil oleh mitra pengangkut.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Status:</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                currentPaymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-orange-100 text-orange-700 border border-orange-300'
              }`} data-testid="payment-status">
                {currentPaymentStatus === 'paid' ? '✓ Sudah Dibayar' : 'Belum Dibayar'}
              </span>
            </div>

            {/* Status Info */}
            {booking.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800 font-medium">
                  Pemesanan Anda sedang menunggu konfirmasi dari admin.
                </p>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-800 font-medium">
                  Pemesanan telah dikonfirmasi. Truk akan segera menuju lokasi Anda.
                </p>
              </div>
            )}

            {booking.status === 'in-transit' && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <p className="text-purple-800 font-medium">
                  Truk sedang dalam perjalanan ke lokasi Anda. Siapkan pembayaran tunai.
                </p>
              </div>
            )}

            {booking.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-medium">
                  Sampah telah diambil dan pembayaran selesai. Terima kasih!
                </p>
              </div>
            )}

            {/* Tombol Hapus - Hanya untuk status pending atau cancelled */}
            {(booking.status === 'pending' || booking.status === 'cancelled') && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteLoading}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  data-testid="delete-booking-button"
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus Pemesanan'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Pemesanan yang sudah dikonfirmasi tidak dapat dihapus
                </p>
              </div>
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
                <p className="font-semibold text-gray-900">Selesai & Dibayar</p>
                <p className="text-sm text-gray-500">Sampah telah diambil dan pembayaran selesai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BookingDetail;