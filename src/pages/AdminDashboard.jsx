import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, BarChart3, Package, DollarSign, Trash2, User, Users, ClipboardList, Download } from 'lucide-react';
import { toast } from 'sonner';
import UserMenu from '@/components/ui/UserMenu';
import * as XLSX from 'xlsx';

const DIVISIONS = ['SDM & IT', 'Keuangan', 'Operasional & Pengolahan'];
const POSITIONS = ['Pimpinan', 'Kepala', 'Staff', 'Anggota'];
const ROLES = ['user', 'staff', 'admin'];

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

const AdminDashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

  // Bookings state
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Staff management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Attendance report state
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    
    // RBAC check
    const isAuthorized = user.role === 'admin' || ['SDM', 'IT', 'SDM & IT', 'Operasional', 'Pengolahan', 'Operasional & Pengolahan'].includes(user.division);
    if (!isAuthorized) {
      toast.error('Akses ditolak. Anda tidak memiliki akses ke halaman ini.');
      navigate('/dashboard');
      return;
    }

    if (user.role !== 'admin' && ['SDM', 'IT', 'SDM & IT'].includes(user.division) && activeTab === 'bookings') {
      setActiveTab('attendance');
    }

    if (user.role === 'admin' || ['Operasional', 'Pengolahan', 'Operasional & Pengolahan'].includes(user.division)) {
      fetchStats();
      fetchAllBookings();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'staff') fetchAllUsers();
    if (activeTab === 'attendance') fetchAttendanceReport();
  }, [activeTab, reportMonth, reportYear]);

  // ── Bookings ──────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const r = await axiosInstance.get('/admin/stats');
      setStats(r.data);
    } catch (e) {
      if (e.response?.status !== 401) toast.error('Gagal memuat statistik');
    }
  };

  const fetchAllBookings = async () => {
    try {
      const r = await axiosInstance.get('/admin/bookings');
      setBookings(r.data);
    } catch (e) {
      if (e.response?.status !== 401) toast.error('Gagal memuat pemesanan');
    } finally { setLoadingBookings(false); }
  };

  const updateBookingStatus = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`/admin/bookings/${id}`, { status: newStatus });
      toast.success('Status berhasil diupdate');
      fetchAllBookings(); fetchStats();
    } catch (e) {
      if (e.response?.status !== 401) toast.error('Gagal mengupdate status');
    }
  };

  // ── Users / Staff ──────────────────────────────────────────────────────────
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const r = await axiosInstance.get('/admin/users');
      setUsers(r.data);
    } catch (e) {
      toast.error('Gagal memuat data pengguna');
    } finally { setLoadingUsers(false); }
  };

  const updateUser = async (userId, field, value) => {
    setUpdatingUserId(userId);
    try {
      await axiosInstance.patch(`/admin/users/${userId}`, { [field]: value });
      toast.success('Data pengguna berhasil diperbarui');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (e) {
      toast.error('Gagal memperbarui data pengguna');
    } finally { setUpdatingUserId(null); }
  };

  // ── Attendance Report ──────────────────────────────────────────────────────
  const fetchAttendanceReport = async () => {
    setLoadingReport(true);
    try {
      const r = await axiosInstance.get(`/attendance/report?month=${reportMonth}&year=${reportYear}`);
      setAttendanceRecords(r.data);
    } catch (e) {
      toast.error('Gagal memuat laporan absensi');
    } finally { setLoadingReport(false); }
  };

  const updateAttendanceStatus = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`/attendance/${id}`, { status: newStatus });
      setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success('Status absensi berhasil diperbarui');
    } catch (e) {
      toast.error('Gagal memperbarui status absensi');
    }
  };

  const exportToExcel = () => {
    if (attendanceRecords.length === 0) {
      toast.warning('Tidak ada data untuk diekspor');
      return;
    }
    const rows = attendanceRecords.map(item => ({
      "tgl": item.date.split('-')[2],
      "Nama": item.user_name,
      "Divisi": item.division || '-',
      "Hadir": item.status === "Hadir" ? "✓" : "",
      "Izin": item.status === "Izin" ? "✓" : "",
      "Sakit": item.status === "Sakit" ? "✓" : "",
      "Terlambat": item.status === "Terlambat" ? "✓" : "",
      "Alpha": item.status === "Alpha" ? "✓" : "",
      "Jam": item.time || '-',
    }));

    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, [
      ["Laporan Evaluasi Bulanan Karyawan"],
      ["PT. ECOngkut Lestari Nusantara"],
      [`Bulan: ${MONTH_NAMES[reportMonth - 1]}`, "", "", "", `Tahun: ${reportYear}`],
      [],
      ["tgl", "Nama", "Divisi", "Hadir", "Izin", "Sakit", "Terlambat", "Alpha", "Jam"]
    ], { origin: "A1" });

    // Merge title cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 12 }];

    XLSX.utils.sheet_add_json(ws, rows, { origin: "A6", skipHeader: true });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
    XLSX.writeFile(wb, `Laporan_Absensi_${MONTH_NAMES[reportMonth - 1]}_${reportYear}.xlsx`);
    toast.success('Laporan berhasil diekspor!');
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const getPaymentStatus = (b) => {
    if (b.status === 'completed') return { text: 'Dibayar', color: 'text-green-600' };
    return { text: b.payment_status === 'paid' ? 'Dibayar' : 'Belum Dibayar', color: b.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600' };
  };
  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', 'in-transit': 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  const statusText = { pending: 'Menunggu', confirmed: 'Dikonfirmasi', 'in-transit': 'Dalam Perjalanan', completed: 'Selesai', cancelled: 'Dibatalkan' };
  const attendanceStatusColor = { Hadir: 'bg-green-100 text-green-700', Terlambat: 'bg-yellow-100 text-yellow-600', Alpha: 'bg-red-100 text-red-700', Izin: 'bg-blue-100 text-blue-700', Sakit: 'bg-yellow-100 text-yellow-600' };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Nav */}
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">ECOngkut Admin</span>
          </div>
          <UserMenu user={user} onLogout={logout} />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Kelola pemesanan, staff, dan laporan absensi</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Pemesanan', value: stats.total_bookings, icon: Package, color: 'blue' },
              { label: 'Menunggu Konfirmasi', value: stats.pending_bookings, icon: Package, color: 'yellow' },
              { label: 'Total Pendapatan', value: formatRupiah(stats.total_revenue), icon: DollarSign, color: 'green', allowed: user?.role === 'admin' || user?.division === 'Keuangan' },
              { label: 'Sampah Terkumpul', value: `${stats.total_waste_collected.toFixed(1)} kg`, icon: Trash2, color: 'emerald' },
            ].filter(s => s.allowed !== false).map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-6 bg-white rounded-2xl shadow-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
                </div>
                <p className="text-gray-600 font-medium">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-1 mb-6 border-b border-gray-200 hide-scrollbar space-x-2">
          {[
            { id: 'bookings', label: 'Pemesanan', icon: ClipboardList, allowed: user?.role === 'admin' || ['Operasional', 'Pengolahan', 'Operasional & Pengolahan'].includes(user?.division) },
            { id: 'staff', label: 'Manajemen Staff', icon: Users, allowed: user?.role === 'admin' || ['SDM', 'IT', 'SDM & IT'].includes(user?.division) },
            { id: 'attendance', label: 'Laporan Absensi', icon: BarChart3, allowed: user?.role === 'admin' || ['SDM', 'IT', 'SDM & IT'].includes(user?.division) },
          ].filter(t => t.allowed).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-5 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-green-600 text-green-700 bg-green-50'
                  : 'border-transparent text-gray-500 hover:text-green-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-900">Semua Pemesanan</h2>
              <Button variant="outline" onClick={() => { fetchAllBookings(); fetchStats(); }} className="border-green-600 text-green-700 hover:bg-green-50">
                Refresh
              </Button>
            </div>
            {loadingBookings ? (
              <div className="text-center py-12 text-gray-500">Memuat...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Belum ada pemesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const pay = getPaymentStatus(booking);
                  return (
                    <div key={booking.id} className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all">
                      <div className="grid md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-green-900">{booking.waste_type_name}</h3>
                          <p className="text-sm text-gray-600">{booking.user_email}</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.pickup_address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Jadwal</p>
                          <p className="font-medium">{booking.pickup_date}</p>
                          <p className="text-sm text-gray-600">{booking.pickup_time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Berat & Harga</p>
                          <p className="font-medium">{booking.estimated_weight} kg</p>
                          <p className="text-lg font-bold text-green-600">{formatRupiah(booking.estimated_price)}</p>
                          <p className={`text-xs mt-1 font-medium ${pay.color}`}>{pay.text}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Update Status</p>
                          <Select value={booking.status} onValueChange={(v) => updateBookingStatus(booking.id, v)}>
                            <SelectTrigger className={`${statusColor[booking.status] || 'bg-gray-100'} border-0 font-medium`}>
                              <SelectValue>{statusText[booking.status] || booking.status}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusText).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: STAFF MANAGEMENT ── */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-900">Manajemen Staff</h2>
                <p className="text-sm text-gray-500 mt-1">Atur role, divisi, dan posisi setiap pengguna</p>
              </div>
              <Button variant="outline" onClick={fetchAllUsers} className="border-green-600 text-green-700 hover:bg-green-50">
                Refresh
              </Button>
            </div>
            {loadingUsers ? (
              <div className="text-center py-12 text-gray-500">Memuat data pengguna...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada pengguna terdaftar</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 pb-2">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="bg-green-50 text-green-800 text-left">
                      <th className="px-4 py-3 rounded-tl-lg font-semibold">Pengguna</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Divisi</th>
                      <th className="px-4 py-3 rounded-tr-lg font-semibold">Posisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${updatingUserId === u.id ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            {u.picture ? (
                              <img src={u.picture} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                            )}
                            <div>
                              <input 
                                type="text"
                                defaultValue={u.name}
                                onBlur={(e) => {
                                  if (e.target.value !== u.name && e.target.value.trim() !== '') {
                                    updateUser(u.id, 'name', e.target.value);
                                  }
                                }}
                                disabled={updatingUserId === u.id || (user?.role !== 'admin' && u.role === 'admin')}
                                className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 focus:outline-none focus:ring-0 px-0 max-w-[150px] transition-colors"
                                title="Klik untuk mengedit nama"
                              />
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Select
                            value={u.role || 'user'}
                            onValueChange={(v) => updateUser(u.id, 'role', v)}
                            disabled={updatingUserId === u.id || (user?.role !== 'admin' && (!['Pimpinan', 'Kepala', 'Kepala Divisi'].includes(user?.position) || u.role === 'admin'))}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4">
                          <Select
                            value={u.division || 'Umum'}
                            onValueChange={(v) => updateUser(u.id, 'division', v)}
                            disabled={updatingUserId === u.id || (user?.role !== 'admin' && u.role === 'admin')}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs border-gray-300">
                              <SelectValue placeholder="Pilih Divisi" />
                            </SelectTrigger>
                            <SelectContent>
                              {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4">
                          <Select
                            value={u.position || 'Anggota'}
                            onValueChange={(v) => updateUser(u.id, 'position', v)}
                            disabled={updatingUserId === u.id || (user?.role !== 'admin' && u.role === 'admin')}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs border-gray-300">
                              <SelectValue placeholder="Pilih Posisi" />
                            </SelectTrigger>
                            <SelectContent>
                              {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ATTENDANCE REPORT ── */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-900">Laporan Absensi</h2>
                <p className="text-sm text-gray-500 mt-1">Laporan Evaluasi Bulanan PT. ECOngkut Lestari Nusantara</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                >
                  {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
                <select
                  className="border border-gray-300 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500"
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                >
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <Button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" /> Ekspor Excel
                </Button>
              </div>
            </div>

            {/* Report Header Preview */}
            <div className="mb-6 py-8 px-4 bg-[#f0fdf4] rounded-2xl border border-green-100 text-center shadow-sm">
              <p className="font-bold text-[#064e3b] text-xl mb-1">Laporan Evaluasi Bulanan Karyawan</p>
              <p className="font-medium text-[#065f46] text-lg mb-3">PT. ECOngkut Lestari Nusantara</p>
              <p className="text-[#047857] text-sm font-medium">Bulan: {MONTH_NAMES[reportMonth - 1]} &nbsp;&nbsp;&nbsp; Tahun: {reportYear}</p>
            </div>

            {loadingReport ? (
              <div className="text-center py-12 text-gray-500">Memuat laporan...</div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data absensi untuk periode ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 pb-2">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-green-700 text-white text-center">
                      <th className="px-3 py-3 font-semibold text-left">Tgl</th>
                      <th className="px-3 py-3 font-semibold text-left">Nama</th>
                      <th className="px-3 py-3 font-semibold text-left">Divisi</th>
                      <th className="px-3 py-3 font-semibold text-center">Status Kehadiran</th>
                      <th className="px-3 py-3 font-semibold text-left">Jam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((rec, i) => (
                      <tr key={rec.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                        <td className="px-3 py-3 font-mono font-semibold text-gray-700">{rec.date.split('-')[2]}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{rec.user_name}</td>
                        <td className="px-3 py-3 text-gray-600">{rec.division || '-'}</td>
                        <td className="px-3 py-4 text-center align-middle">
                          <Select value={rec.status} onValueChange={(v) => updateAttendanceStatus(rec.id, v)}>
                            <SelectTrigger className={`w-28 h-8 text-xs font-bold border-0 mx-auto ${attendanceStatusColor[rec.status] || 'bg-gray-100 text-gray-700'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['Hadir', 'Izin', 'Sakit', 'Terlambat', 'Alpha'].map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-4 text-gray-600 font-mono text-xs">{rec.time || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;