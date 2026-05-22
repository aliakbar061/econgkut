import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import UserMenu from '@/components/ui/UserMenu';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Download, History, Truck, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const StaffDashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Camera & Location state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Hadir");
  const [submitting, setSubmitting] = useState(false);

  // Report State
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMyAttendance();
    return () => stopCamera(); // cleanup
  }, []);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/attendance/me');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil riwayat absensi');
    } finally {
      setLoading(false);
    }
  };

  // Camera Logic
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPhoto(null);
    } catch (err) {
      console.error("Camera access denied:", err);
      toast.error("Gagal mengakses kamera. Pastikan izin telah diberikan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const photoDataUrl = canvasRef.current.toDataURL('image/jpeg');
    setPhoto(photoDataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  // Location Logic
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser ini.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Lokasi berhasil didapatkan!");
      },
      (err) => {
        toast.error("Gagal mendapatkan lokasi. Pastikan izin telah diberikan.");
      }
    );
  };

  // Submit Attendance
  const submitAttendance = async () => {
    if (status === "Hadir" && !photo) {
      toast.error("Silakan ambil foto terlebih dahulu.");
      return;
    }
    if (status === "Hadir" && !location) {
      toast.error("Silakan dapatkan lokasi terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        status,
        photo_base64: photo,
        location: location
      };
      await axiosInstance.post('/attendance', payload);
      toast.success("Absensi berhasil disimpan!");
      setPhoto(null);
      setLocation(null);
      setStatus("Hadir");
      fetchMyAttendance();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan absensi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const res = await axiosInstance.get(`/attendance/report?month=${reportMonth}&year=${reportYear}`);
      const data = res.data;

      // Group by user and summarize
      // We want rows representing days in month?
      // Wait, prompt requires: Laporan Evaluasi Bulanan... tgl | Nama | Hadir | Izin | Sakit | Terlambat | Alpha
      // Normally dates are rows, or users are rows? "tgl | Nama | Hadir | Izin..." indicates date per row, maybe user per row per date.
      // Let's create a flat structure:
      
      const rows = [];
      data.forEach(item => {
        // extract 'tgl' from item.date (format YYYY-MM-DD)
        const day = item.date.split('-')[2];
        rows.push({
          "tgl": day,
          "Nama": item.user_name,
          "Hadir": item.status === "Hadir" ? "v" : "",
          "Izin": item.status === "Izin" ? "v" : "",
          "Sakit": item.status === "Sakit" ? "v" : "",
          "Terlambat": item.status === "Terlambat" ? "v" : "",
          "Alpha": item.status === "Alpha" ? "v" : "",
        });
      });

      // To add the title headers:
      const ws = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws, [
        ["Laporan Evaluasi Bulanan Karyawan"],
        ["PT. ECOngkut Lestari Nusantara"],
        [`Bulan: ${reportMonth}`, `Tahun: ${reportYear}`],
        []
      ], { origin: "A1" });

      XLSX.utils.sheet_add_json(ws, rows, { origin: "A5", skipHeader: false });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Absensi");
      XLSX.writeFile(wb, `Laporan_Absensi_${reportMonth}_${reportYear}.xlsx`);
      toast.success("Laporan berhasil diekspor!");

    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil atau mengekspor laporan.");
    }
  };

  const isHead = user?.position === 'Kepala Divisi' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-green-900 hidden sm:block">ECOngkut Staff</span>
            </div>
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-green-900 mb-2">Portal Absensi Staff</h1>
          <p className="text-gray-600">Divisi: {user?.division || 'Umum'} | Posisi: {user?.position || 'Staff'}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Absensi Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-4 border-b pb-2">Catat Kehadiran</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
                <select 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>

              {/* Tampilkan Camera & Lokasi hanya jika Hadir */}
              {status === "Hadir" && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                    {photo ? (
                      <div className="relative">
                        <img src={photo} alt="Selfie Absen" className="mx-auto rounded-lg max-h-64" />
                        <Button onClick={retakePhoto} size="sm" className="mt-2" variant="outline">Ambil Ulang</Button>
                      </div>
                    ) : (
                      <div>
                        <div className="mx-auto w-full max-w-sm bg-black rounded-lg overflow-hidden">
                          {stream ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                          ) : (
                            <div className="h-48 flex items-center justify-center text-gray-400">Kamera tidak aktif</div>
                          )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="mt-4 flex justify-center space-x-2">
                          {!stream ? (
                            <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                              <Camera className="w-4 h-4 mr-2" /> Buka Kamera
                            </Button>
                          ) : (
                            <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                              <Camera className="w-4 h-4 mr-2" /> Ambil Foto
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Lokasi: </span>
                      {location ? <span className="text-green-600">Terdeteksi ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</span> : <span className="text-red-500">Belum didapatkan</span>}
                    </div>
                    <Button onClick={getLocation} variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" /> {location ? "Perbarui" : "Dapatkan Lokasi"}
                    </Button>
                  </div>
                </>
              )}

              <Button 
                onClick={submitAttendance} 
                className="w-full bg-green-700 hover:bg-green-800 text-white mt-4"
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Kirim Absensi"}
              </Button>
            </div>
          </div>

          {/* History / Report Panel */}
          <div className="space-y-6">
            
            {/* Laporan Khusus Kepala Divisi / Admin */}
            {isHead && (
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 border-l-4 border-l-emerald-500">
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-emerald-600" />
                  Ekspor Laporan Bulanan
                </h2>
                <div className="flex space-x-2 mb-4">
                  <select 
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>Bulan {i+1}</option>
                    ))}
                  </select>
                  <select 
                    className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                  >
                    {[2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={exportToExcel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Ekspor ke Excel (.xlsx)
                </Button>
              </div>
            )}

            {/* Riwayat Absensi Pribadi */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 h-full max-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-green-600" />
                Riwayat Anda
              </h2>
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Memuat...</p>
                ) : history.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada riwayat absensi.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{item.date} {item.time}</p>
                            <p className="text-xs text-gray-500">
                              {item.location ? `Lat: ${item.location.lat.toFixed(4)}, Lng: ${item.location.lng.toFixed(4)}` : "Tanpa Lokasi"}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            item.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                            item.status === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'Alpha' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
