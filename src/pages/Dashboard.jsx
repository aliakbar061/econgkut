import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import UserMenu from '@/components/ui/UserMenu';
import { Button } from '@/components/ui/button';
import {
  Truck, Plus, History, Calendar, Package, User,
  LayoutDashboard, ClipboardCheck, Users, MapPin, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const isStaff = user?.role === 'staff';

  // Booking state (hanya untuk non-staff)
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Attendance state (hanya untuk staff)
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    if (!isStaff) {
      seedData();
      fetchRecentBookings();
    } else {
      fetchRecentAttendance();
    }
  }, []);

  const seedData = async () => {
    try { await axiosInstance.post('/seed-data'); } catch (e) {}
  };

  const fetchRecentBookings = async () => {
    try {
      const res = await axiosInstance.get('/bookings');
      setBookings(res.data.slice(0, 5));
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const res = await axiosInstance.get('/attendance/me');
      setAttendance(res.data.slice(0, 10));
    } catch (e) {
      console.error('Error fetching attendance:', e);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    'in-transit': 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700');

  const getStatusText = (status) => ({
    pending: 'Menunggu', confirmed: 'Dikonfirmasi',
    'in-transit': 'Dalam Perjalanan', completed: 'Selesai', cancelled: 'Dibatalkan',
  }[status] || status);

  const attendanceBadge = {
    Hadir:     { color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
    Terlambat: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    Izin:      { color: 'bg-blue-100 text-blue-700',     icon: CheckCircle2 },
    Sakit:     { color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
    Alpha:     { color: 'bg-red-100 text-red-700',       icon: AlertCircle },
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
              <span className="font-bold text-lg text-green-900 hidden sm:block">ECOngkut</span>
            </div>
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {isStaff
              ? `Divisi: ${user?.division || 'Umum'} · Posisi: ${user?.position || 'Staff'}`
              : 'Kelola pemesanan pengangkutan sampah Anda dengan mudah'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">

          {/* Kartu booking — HANYA tampil untuk non-staff */}
          {!isStaff && (
            <>
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
                  Mulai Pesan <Plus className="ml-2 w-5 h-5" />
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
                  Lihat Riwayat <History className="ml-2 w-5 h-5" />
                </div>
              </div>
            </>
          )}

          {/* Portal Absensi — untuk staff & admin */}
          {(isStaff || user?.role === 'admin') && (
            <div
              className="p-8 bg-white rounded-2xl shadow-lg border border-teal-100 card-hover cursor-pointer"
              onClick={() => navigate('/staff')}
              data-testid="staff-attendance-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-8 h-8 text-white" />
                </div>
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900 mb-2">Portal Absensi Staff</h2>
              <p className="text-gray-600 mb-4">Catat kehadiran harian dengan lokasi GPS</p>
              <div className="flex items-center text-teal-600 font-medium">
                Buka Portal <ClipboardCheck className="ml-2 w-5 h-5" />
              </div>
            </div>
          )}

          {/* Admin Dashboard — untuk admin & divisi terkait */}
          {(user?.role === 'admin' || (user?.role === 'staff' && ['SDM', 'IT', 'Operasional', 'Pengolahan'].includes(user?.division))) && (
            <div
              className="p-8 bg-white rounded-2xl shadow-lg border border-purple-100 card-hover cursor-pointer"
              onClick={() => navigate('/admin')}
              data-testid="admin-dashboard-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="w-8 h-8 text-white" />
                </div>
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600 mb-4">Kelola pemesanan, staff, dan laporan absensi</p>
              <div className="flex items-center text-purple-600 font-medium">
                Kelola Sistem <LayoutDashboard className="ml-2 w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION BAWAH: berbeda per role ── */}

        {/* Untuk staff: Riwayat Absensi Terbaru */}
        {isStaff && (
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-teal-600" />
                Riwayat Absensi Saya
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate('/staff')}
                className="border-teal-600 text-teal-700 hover:bg-teal-50"
              >
                Absen Sekarang
              </Button>
            </div>

            {loadingAttendance ? (
              <div className="text-center py-12 text-gray-500">Memuat...</div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Belum ada riwayat absensi</p>
                <Button
                  onClick={() => navigate('/staff')}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Mulai Absen Hari Ini
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {attendance.map((rec) => {
                  const badge = attendanceBadge[rec.status] || { color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 };
                  const BadgeIcon = badge.icon;
                  return (
                    <div key={rec.id} className="p-4 border border-gray-100 rounded-xl hover:border-teal-200 hover:bg-teal-50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{rec.date}</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="text-sm text-gray-500">{rec.time}</span>
                          </div>
                          {rec.location?.address ? (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-teal-500 flex-shrink-0" />
                              {rec.location.address}
                            </p>
                          ) : rec.location ? (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {rec.location.lat?.toFixed(4)}, {rec.location.lng?.toFixed(4)}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">Tanpa lokasi</p>
                          )}
                        </div>
                        <span className={`ml-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Untuk non-staff: Recent Bookings (seperti semula) */}
        {!isStaff && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-900">Terbaru</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/bookings')}
                className="border-green-600 text-green-700 hover:bg-green-50"
                data-testid="view-all-bookings-button"
              >
                Lihat Semua
              </Button>
            </div>

            {loadingBookings ? (
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
                      <span className="font-semibold text-green-600">{formatRupiah(booking.estimated_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;