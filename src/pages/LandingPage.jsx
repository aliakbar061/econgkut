import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Recycle, Truck, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '@/App';
import { toast } from 'sonner';

const LandingPage = () => {
  const googleButtonRef = useRef(null);
  const { setUser, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('REACT_APP_GOOGLE_CLIENT_ID tidak ditemukan');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      ux_mode: 'popup',
    });

    if (googleButtonRef.current) {
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 250,
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      console.log('Login berhasil:', payload.email);

      // ✅ Gunakan axiosInstance dari context
      const backendResponse = await axiosInstance.post('/auth/google', { 
        token: credential,
        user: {
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        }
      });

      const data = backendResponse.data;
      console.log('Backend response:', data);
      
      // ✅ PENTING: Simpan dengan key 'sessionToken' (konsisten dengan App.js)
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture,
          role: data.role
        }));
        
        // ✅ Update user context
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture,
          role: data.role
        });
      }

      // ✅ Show success toast
      toast.success(`Selamat datang, ${data.name}!`);
      
      // ✅ Redirect to dashboard using navigate
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login gagal: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleLogin = () => {
    if (!window.google) {
      toast.warning('Google Sign-In sedang dimuat, silakan coba lagi');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Popup dismissed by user');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">EcoCollect</span>
          </div>
          
          <Button 
            onClick={handleLogin}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
            data-testid="nav-login-button"
          >
            Masuk dengan Google
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-6">
                <Leaf className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Solusi Ramah Lingkungan</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-green-900 mb-6 leading-tight">
                Kelola Sampah Anda dengan Mudah & Bertanggung Jawab
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Pesan truk pengangkutan sampah organik dan non-organik yang dapat didaur ulang. 
                Kami membantu menciptakan lingkungan yang lebih bersih dan hijau untuk generasi mendatang.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 text-base"
                  data-testid="hero-get-started-button"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-full px-8 text-base"
                  data-testid="hero-learn-more-button"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80" 
                  alt="Waste Collection" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-green-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900 mb-4">Mengapa Memilih EcoCollect?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platform pemesanan truk sampah yang mudah, cepat, dan ramah lingkungan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow" data-testid="feature-easy-booking">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Pemesanan Mudah</h3>
              <p className="text-gray-600 text-sm">
                Pesan truk pengangkutan sampah hanya dalam beberapa klik dengan antarmuka yang intuitif
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow" data-testid="feature-waste-separation">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Pemisahan Sampah</h3>
              <p className="text-gray-600 text-sm">
                Kami menangani sampah organik dan non-organik yang dapat didaur ulang secara terpisah
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow" data-testid="feature-tracking">
              <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Tracking Real-time</h3>
              <p className="text-gray-600 text-sm">
                Pantau status pengambilan sampah Anda secara real-time dari pemesanan hingga selesai
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow" data-testid="feature-certified">
              <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Bersertifikat</h3>
              <p className="text-gray-600 text-sm">
                Layanan kami telah bersertifikat dan mengikuti standar pengelolaan sampah yang baik
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Proses pemesanan yang sederhana dan cepat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-register">
              <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Daftar & Login</h3>
              <p className="text-green-100">
                Buat akun atau masuk dengan akun Google Anda untuk memulai
              </p>
            </div>

            <div className="text-center" data-testid="step-book">
              <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Pesan Truk</h3>
              <p className="text-green-100">
                Pilih jenis sampah, estimasi berat, dan jadwal pengambilan yang sesuai
              </p>
            </div>

            <div className="text-center" data-testid="step-collect">
              <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Pengambilan</h3>
              <p className="text-green-100">
                Truk kami akan datang sesuai jadwal untuk mengambil sampah Anda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">
            Siap Berkontribusi untuk Lingkungan yang Lebih Baik?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Bergabunglah dengan ribuan pengguna yang telah mempercayai layanan kami
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-12 text-base"
            data-testid="cta-button"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-green-200">
            © 2025 EcoCollect. Semua hak dilindungi. Platform Pengelolaan Sampah Ramah Lingkungan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;