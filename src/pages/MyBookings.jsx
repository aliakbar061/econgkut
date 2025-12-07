import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Truck, Search, Package, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MyBookings = () => {
  const { user, axiosInstance } = useContext(AuthContext); // ← Tambahkan axiosInstance
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/bookings'); // ← Ganti axios dengan axiosInstance
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.waste_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.pickup_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-transit': 'bg-purple-100 text-purple-700 border-purple-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-green-700"
                data-testid="back-to-dashboard-button"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Riwayat Pemesanan</h1>
          <p className="text-lg text-gray-600">Lihat dan kelola semua pemesanan Anda</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cari berdasarkan jenis sampah atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-500"
                data-testid="search-bookings-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-green-200 focus:border-green-500" data-testid="status-filter-select">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="in-transit">Dalam Perjalanan</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Memuat...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12" data-testid="no-bookings-found">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm || statusFilter !== 'all' ? 'Tidak ada pemesanan yang cocok' : 'Belum ada pemesanan'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => navigate('/new-booking')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="create-new-booking-button"
                >
                  Buat Pemesanan Baru
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4" data-testid="bookings-list">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md cursor-pointer card-hover"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                  data-testid={`booking-item-${booking.id}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-xl text-green-900">{booking.waste_type_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">📍 {booking.pickup_address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {booking.pickup_date}</span>
                        <span>🕔 {booking.pickup_time}</span>
                        <span>⚖️ {booking.estimated_weight} kg</span>
                        <span className={`font-medium ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {booking.payment_status === 'paid' ? '✅ Dibayar' : '⏳ Belum Dibayar'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${booking.estimated_price.toFixed(2)}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
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

export default MyBookings;