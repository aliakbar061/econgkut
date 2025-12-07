import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import UserMenu from '@/components/ui/UserMenu';
import { Button } from '@/components/ui/button';
import { Truck, Plus, History, LogOut, Calendar, Package, User, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext); // ← Tambahkan axiosInstance
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    fetchRecentBookings();
  }, []);

  const seedData = async () => {
    try {
      await axiosInstance.post('/seed-data'); // ← Ganti axios dengan axiosInstance
      console.log('✅ Seed data called');
    } catch (error) {
      console.log('Seed data error:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await axiosInstance.get('/bookings'); // ← Ganti axios dengan axiosInstance
      setBookings(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      'in-transit': 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      'in-transit': 'Dalam Perjalanan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Selamat Datang, {user?.name}! 👋</h1>
          <p className="text-lg text-gray-600">Kelola pemesanan pengangkutan sampah Anda dengan mudah</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div 
            className="p-8 bg-white rounded-2xl shadow-lg border border-green-100 card-hover cursor-pointer" 
            onClick={() => navigate('/new-booking')}
            data-testid="new-booking-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Pemesanan Baru</h2>
            <p className="text-gray-600 mb-4">Pesan truk pengangkutan sampah untuk lokasi Anda</p>
            <div className="flex items-center text-green-600 font-medium">
              Mulai Pesan
              <Plus className="ml-2 w-5 h-5" />
            </div>
          </div>

          <div 
            className="p-8 bg-white rounded-2xl shadow-lg border border-green-100 card-hover cursor-pointer" 
            onClick={() => navigate('/bookings')}
            data-testid="my-bookings-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
                <History className="w-8 h-8 text-white" />
              </div>
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Riwayat Pemesanan</h2>
            <p className="text-gray-600 mb-4">Lihat semua pemesanan dan statusnya</p>
            <div className="flex items-center text-emerald-600 font-medium">
              Lihat Riwayat
              <History className="ml-2 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-900">Terbaru</h2>
            <Button
              variant="outline"
              onClick={() => navigate('/bookings')}
              className="border-green-600 text-green-700 hover:bg-green-50"
              data-testid="view-all-bookings-button">
              Lihat Semua
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Memuat...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12" data-testid="no-bookings-message">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Belum ada pemesanan</p>
              <Button
                onClick={() => navigate('/new-booking')}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="create-first-booking-button"
              >
                Buat Pemesanan Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-testid="bookings-list">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  data-testid={`booking-item-${booking.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-green-900">{booking.waste_type_name}</h3>
                      <p className="text-sm text-gray-600">{booking.pickup_address}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-semibold text-green-600">Rp. {booking.estimated_price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;