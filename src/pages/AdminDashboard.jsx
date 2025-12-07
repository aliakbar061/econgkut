import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, BarChart3, Package, DollarSign, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import UserMenu from '@/components/ui/UserMenu';

const AdminDashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext); // ✅ Tambahkan axiosInstance
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check if user is admin
    if (!user) {
      navigate('/');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Akses ditolak. Hanya admin yang bisa mengakses halaman ini.');
      navigate('/dashboard');
      return;
    }

    fetchStats();
    fetchAllBookings();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/stats'); // ✅ Gunakan axiosInstance
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
      if (error.response?.status !== 401) {
        toast.error('Gagal memuat statistik');
      }
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await axiosInstance.get('/admin/bookings'); // ✅ Gunakan axiosInstance
      setBookings(response.data);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      if (error.response?.status !== 401) {
        toast.error('Gagal memuat pemesanan');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axiosInstance.patch( // ✅ Gunakan axiosInstance
        `/admin/bookings/${bookingId}`,
        { status: newStatus }
      );
      toast.success('Status berhasil diupdate');
      fetchAllBookings();
      fetchStats();
    } catch (error) {
      console.error('Update status error:', error);
      if (error.response?.status !== 401) {
        toast.error('Gagal mengupdate status');
      }
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
              <span className="text-xl font-bold text-green-800">ECOngkut Admin</span>
            </div>
            
            {/* ✅ User Menu with logout */}
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Kelola semua pemesanan dan statistik</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-testid="admin-stats">
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-blue-600">{stats.total_bookings}</span>
              </div>
              <p className="text-gray-600 font-medium">Total Pemesanan</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-3xl font-bold text-yellow-600">{stats.pending_bookings}</span>
              </div>
              <p className="text-gray-600 font-medium">Menunggu Konfirmasi</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-green-600">Rp {stats.total_revenue.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-gray-600 font-medium">Total Pendapatan</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-3xl font-bold text-emerald-600">{stats.total_waste_collected.toFixed(1)} kg</span>
              </div>
              <p className="text-gray-600 font-medium">Sampah Terkumpul</p>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-900">Semua Pemesanan</h2>
            <Button
              variant="outline"
              onClick={() => {
                fetchAllBookings();
                fetchStats();
              }}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Memuat...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12" data-testid="no-bookings-message">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada pemesanan</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="admin-bookings-list">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
                  data-testid={`admin-booking-item-${booking.id}`}
                >
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-lg text-green-900">{booking.waste_type_name}</h3>
                      <p className="text-sm text-gray-600">{booking.user_email}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.pickup_address}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Jadwal</p>
                      <p className="font-medium text-gray-900">{booking.pickup_date}</p>
                      <p className="text-sm text-gray-600">{booking.pickup_time}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Berat & Harga</p>
                      <p className="font-medium text-gray-900">{booking.estimated_weight} kg</p>
                      <p className="text-lg font-bold text-green-600">Rp {booking.estimated_price.toLocaleString('id-ID')}</p>
                      <p className={`text-xs mt-1 ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {booking.payment_status === 'paid' ? '✓ Dibayar' : '⏳ Belum Dibayar'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Update Status</p>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking.id, value)}
                      >
                        <SelectTrigger 
                          className={`${getStatusColor(booking.status)} border-0 font-medium`}
                          data-testid={`status-select-${booking.id}`}
                        >
                          <SelectValue>{getStatusText(booking.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Menunggu</SelectItem>
                          <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                          <SelectItem value="in-transit">Dalam Perjalanan</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                          <SelectItem value="cancelled">Dibatalkan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

export default AdminDashboard;