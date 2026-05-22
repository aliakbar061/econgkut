import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import UserMenu from '@/components/ui/UserMenu';
import { Button } from '@/components/ui/button';
import {
  Download, History, Truck, MapPin, Loader2,
  CheckCircle2, Clock, AlertCircle, ClipboardCheck, Navigation, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const attendanceBadge = {
  Hadir:     { color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500' },
  Terlambat: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  Izin:      { color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  Sakit:     { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Alpha:     { color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500' },
};

const StaffDashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form state
  const [status, setStatus] = useState('Hadir');
  const [submitting, setSubmitting] = useState(false);

  // Location state
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Export state
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const isHead = user?.position === 'Kepala Divisi' || user?.role === 'admin';

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get('/attendance/me');
      setHistory(res.data);
    } catch (err) {
      toast.error('Gagal mengambil riwayat absensi');
    } finally {
      setLoadingHistory(false);
    }
  };

  // ── Reverse Geocoding via OpenStreetMap Nominatim ──────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`,
        { headers: { 'User-Agent': 'ECOngkut-AbsensiApp/1.0' } }
      );
      const data = await res.json();
      const addr = data.address || {};

      const parts = [
        addr.road || addr.pedestrian || addr.footway || addr.path,
        addr.village || addr.suburb || addr.neighbourhood,
        addr.city_district || addr.county,
        addr.city || addr.town || addr.municipality,
        addr.state,
        addr.postcode,
      ].filter(Boolean);

      return {
        address: parts.join(', ') || data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        detail: {
          jalan: addr.road || addr.pedestrian || '-',
          kelurahan: addr.village || addr.suburb || '-',
          kecamatan: addr.city_district || addr.county || '-',
          kota: addr.city || addr.town || addr.municipality || '-',
          provinsi: addr.state || '-',
          kodePos: addr.postcode || '-',
        }
      };
    } catch {
      return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, detail: null };
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung oleh browser ini.');
      return;
    }
    setGettingLocation(true);
    setLocation(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const geo = await reverseGeocode(lat, lng);
          setLocation({ lat, lng, ...geo });
          toast.success('Lokasi berhasil didapatkan!');
        } catch {
          setLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, detail: null });
          toast.success('Koordinat berhasil didapatkan.');
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        toast.error('Gagal mendapatkan lokasi. Pastikan izin telah diberikan.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Submit Attendance ──────────────────────────────────────────────────────
  const submitAttendance = async () => {
    if (status === 'Hadir' && !location) {
      toast.error('Silakan dapatkan lokasi terlebih dahulu untuk absen Hadir.');
      return;
    }

    const today = new Date().toLocaleDateString('sv-SE');
    const alreadyAbsen = history.some(h => h.date === today);
    if (alreadyAbsen) {
      toast.warning('Anda sudah melakukan absensi hari ini.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        status,
        location: location
          ? { lat: location.lat, lng: location.lng, address: location.address }
          : null,
      };
      await axiosInstance.post('/attendance', payload);
      toast.success('Absensi berhasil disimpan!');
      setLocation(null);
      setStatus('Hadir');
      fetchMyAttendance();
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan absensi.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Export Excel ───────────────────────────────────────────────────────────
  const exportToExcel = async () => {
    try {
      const res = await axiosInstance.get(`/attendance/report?month=${reportMonth}&year=${reportYear}`);
      const data = res.data;
      if (!data.length) { toast.warning('Tidak ada data untuk diekspor.'); return; }

      const rows = data.map(item => ({
        "tgl": item.date.split('-')[2],
        "Nama": item.user_name,
        "Divisi": item.division || '-',
        "Status Kehadiran": item.status,
        "Jam": item.time || '-',
        "Lokasi": item.location?.address || (item.location ? `${item.location.lat?.toFixed(4)}, ${item.location.lng?.toFixed(4)}` : '-'),
      }));

      const ws = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [
        ['Laporan Absensi Bulanan Karyawan'],
        ['PT. ECOngkut Lestari Nusantara'],
        ['Bulan:', MONTH_NAMES[reportMonth - 1] || reportMonth, '', 'Tahun:', reportYear],
        [],
        ['tgl', 'Nama', 'Divisi', 'Status Kehadiran', 'Jam', 'Lokasi'],
      ], { origin: 'A1' });

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      ];
      ws['!cols'] = [
        { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 10 }, { wch: 45 },
      ];

      XLSX.utils.sheet_add_json(ws, rows, { origin: 'A6', skipHeader: true });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Absensi');
      XLSX.writeFile(wb, `Laporan_Absensi_${MONTH_NAMES[reportMonth - 1]}_${reportYear}.xlsx`);
      toast.success('Laporan berhasil diekspor!');
    } catch {
      toast.error('Gagal mengekspor laporan.');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const todayStr = new Date().toLocaleDateString('sv-SE');
  const sudahAbsenHariIni = history.some(h => h.date === todayStr);
  const todayRecord = history.find(h => h.date === todayStr);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100">

      {/* ── Nav ── */}
      <nav className="bg-white border-b border-teal-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-teal-50 hover:bg-teal-100 rounded-full text-teal-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-teal-900 leading-none text-sm sm:text-base">Staff</p>
                <p className="text-xs text-teal-600">Portal Absensi</p>
              </div>
            </div>
          </div>
          <UserMenu user={user} onLogout={logout} />
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-900 mb-1">Portal Absensi</h1>
          <p className="text-sm sm:text-base text-gray-500 flex flex-wrap gap-1">
            <span>Divisi: <span className="font-semibold text-teal-700">{user?.division || 'Umum'}</span></span>
            <span className="text-gray-300 hidden sm:inline">·</span>
            <span>Posisi: <span className="font-semibold text-teal-700">{user?.position || 'Staff'}</span></span>
          </p>
        </div>

        {/* Status Hari Ini Banner */}
        {sudahAbsenHariIni && todayRecord && (
          <div className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl border flex items-start sm:items-center gap-3 ${attendanceBadge[todayRecord.status]?.color || 'bg-gray-100'}`}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 hidden sm:block" />
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                Sudah absen hari ini —&nbsp;
                <span className="uppercase">{todayRecord.status}</span>
              </p>
              <p className="text-xs sm:text-sm opacity-80 truncate">
                Jam {todayRecord.time} · {todayRecord.location?.address || 'Tanpa lokasi'}
              </p>
            </div>
          </div>
        )}

        {/* ── Grid Utama: Form + Panel Kanan ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">

          {/* ── FORM ABSENSI ── */}
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-teal-900 mb-4 sm:mb-5 flex items-center gap-2 truncate">
              <ClipboardCheck className="w-5 h-5 text-teal-600 flex-shrink-0 hidden sm:block" />
              <span className="truncate">Catat Kehadiran Hari Ini</span>
            </h2>

            <div className="space-y-4 sm:space-y-5">

              {/* Pilih Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Hadir', 'Izin', 'Sakit'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all ${
                        status === s
                          ? s === 'Hadir'
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : s === 'Izin'
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-snug">
                  * Status <span className="font-semibold">Terlambat</span> ditentukan otomatis jika absen Hadir setelah pukul 08:00 WITA
                </p>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lokasi Saat Ini {status === 'Hadir' && <span className="text-red-500">*</span>}
                </label>

                {location ? (
                  <div className="p-3 sm:p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-medium text-teal-800 leading-snug">{location.address}</p>
                    </div>
                    {location.detail && (
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-teal-700 border-t border-teal-200 pt-2 sm:pt-3">
                        <div><span className="text-teal-400">Jalan</span><br />{location.detail.jalan}</div>
                        <div><span className="text-teal-400">Kelurahan</span><br />{location.detail.kelurahan}</div>
                        <div><span className="text-teal-400">Kecamatan</span><br />{location.detail.kecamatan}</div>
                        <div><span className="text-teal-400">Kota/Kab</span><br />{location.detail.kota}</div>
                        <div><span className="text-teal-400">Provinsi</span><br />{location.detail.provinsi}</div>
                        <div><span className="text-teal-400">Kode Pos</span><br />{location.detail.kodePos}</div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-teal-600 border-t border-teal-200 pt-2">
                      <span className="font-mono truncate">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                      <button onClick={getLocation} className="ml-auto flex-shrink-0 text-teal-500 hover:text-teal-700 underline whitespace-nowrap">
                        Perbarui
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={getLocation}
                    disabled={gettingLocation}
                    className="w-full py-4 sm:py-5 border-2 border-dashed border-teal-300 rounded-xl text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-60"
                  >
                    {gettingLocation ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mendapatkan lokasi...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        Deteksi Lokasi Saya
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tombol Submit */}
              <Button
                onClick={submitAttendance}
                disabled={submitting || sudahAbsenHariIni}
                className={`w-full py-3 text-sm sm:text-base font-semibold rounded-xl transition-all ${
                  sudahAbsenHariIni
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </span>
                ) : sudahAbsenHariIni ? (
                  '✓ Sudah Absen Hari Ini'
                ) : (
                  'Kirim Absensi'
                )}
              </Button>

            </div>
          </div>

          {/* ── PANEL KANAN ── */}
          <div className="space-y-4 sm:space-y-6">

            {/* Ekspor — Kepala Divisi & Admin */}
            {isHead && (
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6 border-l-4 border-l-emerald-500">
                <h2 className="text-base sm:text-lg font-bold text-emerald-900 mb-3 sm:mb-4 flex items-center gap-2 truncate">
                  <Download className="w-5 h-5 text-emerald-600 flex-shrink-0 hidden sm:block" />
                  <span className="truncate">Ekspor Laporan Bulanan</span>
                </h2>
                <div className="flex gap-2 mb-3 sm:mb-4">
                  <select
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    className="w-20 sm:w-28 border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-400"
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={exportToExcel}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Ekspor ke Excel (.xlsx)
                </Button>
              </div>
            )}

            {/* Riwayat Absensi Pribadi */}
            <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-4 sm:p-6 flex flex-col"
              style={{ maxHeight: isHead ? '380px' : '520px' }}>
              <h2 className="text-base sm:text-lg font-bold text-teal-900 mb-3 sm:mb-4 flex items-center gap-2 flex-shrink-0 truncate">
                <History className="w-5 h-5 text-teal-600 flex-shrink-0 hidden sm:block" />
                <span className="truncate">Riwayat Absensi</span>
              </h2>
              <div className="overflow-y-auto flex-1 space-y-2 sm:space-y-3 pr-1">
                {loadingHistory ? (
                  <div className="text-center py-8 text-gray-500">
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mx-auto mb-2 text-teal-400" />
                    <p className="text-sm">Memuat...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardCheck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Belum ada riwayat absensi.</p>
                  </div>
                ) : (
                  history.map((item) => {
                    const badge = attendanceBadge[item.status] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
                    return (
                      <div key={item.id} className="p-2.5 sm:p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-800 text-xs sm:text-sm">{item.date}</span>
                              <span className="text-gray-300 hidden sm:inline">·</span>
                              <span className="text-xs text-gray-500 font-mono">{item.time}</span>
                            </div>
                            {item.location?.address ? (
                              <p className="text-xs text-gray-500 flex items-start gap-1 leading-snug">
                                <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{item.location.address}</span>
                              </p>
                            ) : item.location ? (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.location.lat?.toFixed(5)}, {item.location.lng?.toFixed(5)}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-300">Tanpa lokasi</p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
