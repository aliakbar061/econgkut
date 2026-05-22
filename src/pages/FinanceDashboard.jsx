import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import UserMenu from '@/components/ui/UserMenu';
import { Button } from '@/components/ui/button';
import {
  Banknote, TrendingUp, TrendingDown, Wallet, Calendar, Plus, Trash2, ArrowLeft, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const FinanceDashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Gaji Karyawan',
    amount: '',
    date: new Date().toLocaleDateString('sv-SE'),
    notes: ''
  });

  const MONTH_NAMES = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'
  ];

  const EXPENSE_CATEGORIES = [
    'Gaji Karyawan', 'BBM Truk', 'Pemeliharaan Truk', 
    'Alat Kebersihan', 'Pemasaran', 'Operasional Kantor', 'Lain-lain'
  ];

  const REVENUE_CATEGORIES = [
    'Subsidi Pemerintah', 'Penjualan Barang Bekas', 'Lain-lain'
  ];

  useEffect(() => {
    // Role protection
    if (user?.role !== 'admin' && user?.division !== 'Keuangan' && user?.position !== 'Pimpinan') {
      toast.error('Anda tidak memiliki akses ke halaman ini');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [reportMonth, reportYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, transRes] = await Promise.all([
        axiosInstance.get(`/finance/report?month=${reportMonth}&year=${reportYear}`),
        axiosInstance.get('/finance/transactions')
      ]);
      
      setReport(reportRes.data);
      // Filter transactions for table (only current selected month/year)
      const filteredTrans = transRes.data.filter(t => {
        const d = new Date(t.date);
        return (d.getMonth() + 1) === reportMonth && d.getFullYear() === reportYear;
      });
      setTransactions(filteredTrans);
    } catch (err) {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Nominal tidak valid');
      return;
    }
    
    try {
      setSubmitting(true);
      await axiosInstance.post('/finance/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Pencatatan berhasil disimpan!');
      setShowForm(false);
      setFormData({
        ...formData,
        amount: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan pencatatan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pencatatan ini?')) return;
    try {
      await axiosInstance.delete(`/finance/transactions/${id}`);
      toast.success('Catatan berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus catatan');
    }
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
              className="p-2 bg-green-50 hover:bg-green-100 rounded-full text-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-green-900 leading-none text-sm sm:text-base">Keuangan</p>
                <p className="text-xs text-green-600">Laporan & Cashflow</p>
              </div>
            </div>
          </div>
          <UserMenu user={user} onLogout={logout} />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-900">Dashboard Keuangan</h1>
            <p className="text-gray-500 text-sm sm:text-base">Ringkasan laba rugi dan pencatatan kas bulanan.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-green-100 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-green-500 ml-2" />
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer border-l pl-2"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-green-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Total Pendapatan (Semua Waktu)</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-green-700">{formatRupiah(report.all_time_revenue || report.total_revenue)}</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Bulan ini: {formatRupiah(report.total_revenue)} ({report.paid_bookings_count} trx)
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-red-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Total Pengeluaran (Semua Waktu)</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-red-600">{formatRupiah(report.all_time_expense || report.total_expense)}</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Bulan ini: {formatRupiah(report.total_expense)} ({report.transactions_count} trx)
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${((report.all_time_revenue || report.total_revenue) - (report.all_time_expense || report.total_expense)) >= 0 ? 'from-emerald-500 to-green-600' : 'from-orange-500 to-red-600'} rounded-2xl p-5 sm:p-6 shadow-md text-white relative overflow-hidden`}>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">
                    {((report.all_time_revenue || report.total_revenue) - (report.all_time_expense || report.total_expense)) >= 0 ? 'Laba Bersih (Semua Waktu)' : 'Rugi Bersih (Semua Waktu)'}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold">{formatRupiah(Math.abs((report.all_time_revenue || report.total_revenue) - (report.all_time_expense || report.total_expense)))}</h3>
                  <p className="text-xs text-white/70 mt-2">
                    Bulan ini: {formatRupiah(report.net_profit)} ({MONTH_NAMES[reportMonth-1]} {reportYear})
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Table Area (Takes 2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Riwayat Pencatatan</h2>
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 h-auto lg:hidden"
                >
                  {showForm ? 'Tutup Formulir' : <><Plus className="w-4 h-4" /> Catat Kas</>}
                </Button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-400">Memuat data...</div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <Banknote className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada pencatatan keuangan manual di bulan ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Tanggal</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Kategori</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Nominal</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Pencatat</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-2 text-sm text-gray-700 font-medium">
                            {t.date}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              t.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {t.category}
                            </span>
                            {t.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-1" title={t.notes}>{t.notes}</p>}
                          </td>
                          <td className="py-3 px-2 text-sm font-bold text-gray-700">
                            <span className={t.type === 'expense' ? 'text-red-500' : 'text-green-600'}>
                              {t.type === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {t.user_name}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button 
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form Area (Sidebar on large screens) */}
          <div className={`lg:block ${showForm ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Catat Transaksi Baru
              </h2>
              
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'expense', category: EXPENSE_CATEGORIES[0]})}
                      className={`py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                        formData.type === 'expense' 
                          ? 'border-red-500 bg-red-50 text-red-600' 
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      Pengeluaran
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'revenue', category: REVENUE_CATEGORIES[0]})}
                      className={`py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                        formData.type === 'revenue' 
                          ? 'border-green-500 bg-green-50 text-green-600' 
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      Pemasukan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {(formData.type === 'expense' ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="Contoh: 50000"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan / Keterangan</label>
                  <textarea 
                    rows="2"
                    placeholder="Contoh: Beli bensin truk box"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                    formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {submitting ? (
                    <span className="flex justify-center items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</span>
                  ) : (
                    'Simpan Catatan'
                  )}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
