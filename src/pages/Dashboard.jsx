import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/ui/UserMenu'; // ✅ Import UserMenu
import { Truck, Plus, History, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    seedData();
  }, []);

  const seedData = async () => {
    try {
      await axiosInstance.post('/seed-data');
      console.log('✅ Seed data called');
    } catch (error) {
      console.error('Seed data error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-green-800">EcoCollect</span>
            </div>

            {/* User Menu - ✅ Ganti dengan UserMenu component */}
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </nav>

      {/* Rest of dashboard content... */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Kelola sampah Anda dengan mudah dan bertanggung jawab
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Button
            onClick={() => navigate('/new-booking')}
            className="h-32 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
            data-testid="new-booking-button"
          >
            <div className="flex flex-col items-center space-y-3">
              <Plus className="w-8 h-8" />
              <span className="text-lg font-semibold">Pemesanan Baru</span>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/bookings')}
            variant="outline"
            className="h-32 border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            data-testid="my-bookings-button"
          >
            <div className="flex flex-col items-center space-y-3">
              <History className="w-8 h-8" />
              <span className="text-lg font-semibold">Riwayat Pemesanan</span>
            </div>
          </Button>

          {user?.role === 'admin' && (
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="h-32 border-2 border-purple-600 text-purple-700 hover:bg-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              data-testid="admin-button"
            >
              <div className="flex flex-col items-center space-y-3">
                <Shield className="w-8 h-8" />
                <span className="text-lg font-semibold">Admin Panel</span>
              </div>
            </Button>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
            <h3 className="text-2xl font-bold text-green-900 mb-4">
              Tentang Layanan Kami
            </h3>
            <p className="text-gray-600 leading-relaxed">
              EcoCollect membantu Anda mengelola sampah dengan lebih baik. 
              Kami menyediakan layanan pengangkutan sampah organik dan non-organik 
              yang dapat didaur ulang dengan proses yang ramah lingkungan.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Dampak Positif</h3>
            <p className="leading-relaxed opacity-90">
              Dengan menggunakan layanan kami, Anda berkontribusi dalam 
              mengurangi limbah dan menciptakan lingkungan yang lebih bersih 
              untuk generasi mendatang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;