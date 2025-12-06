import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Truck, Calendar, MapPin, Weight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingForm = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [formData, setFormData] = useState({
    pickup_address: '',
    waste_type_id: '',
    estimated_weight: '',
    pickup_date: '',
    pickup_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchWasteTypes();
  }, []);

  const fetchWasteTypes = async () => {
    try {
      const response = await axios.get(`${API}/waste-types`, { withCredentials: true });
      setWasteTypes(response.data);
    } catch (error) {
      toast.error('Gagal memuat jenis sampah');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.waste_type_id || !formData.estimated_weight || !formData.pickup_date || !formData.pickup_time || !formData.pickup_address) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/bookings`, formData, { withCredentials: true });
      toast.success('Pemesanan berhasil dibuat!');
      navigate(`/bookings/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal membuat pemesanan');
    } finally {
      setLoading(false);
    }
  };

  const selectedWasteType = wasteTypes.find(w => w.id === formData.waste_type_id);
  const estimatedPrice = selectedWasteType && formData.estimated_weight 
    ? (selectedWasteType.price_per_kg * parseFloat(formData.estimated_weight)).toFixed(2)
    : '0.00';

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
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-green-900 mb-2">Pemesanan Baru</h1>
          <p className="text-lg text-gray-600">Isi formulir di bawah untuk memesan truk pengangkutan sampah</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 space-y-6">
          {/* Pickup Address */}
          <div className="space-y-2">
            <Label htmlFor="pickup_address" className="text-green-900 font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-600" />
              Alamat Pengambilan *
            </Label>
            <Textarea
              id="pickup_address"
              placeholder="Masukkan alamat lengkap untuk pengambilan sampah"
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="border-green-200 focus:border-green-500"
              rows={3}
              required
              data-testid="pickup-address-input"
            />
          </div>

          {/* Waste Type */}
          <div className="space-y-2">
            <Label htmlFor="waste_type" className="text-green-900 font-medium">
              Jenis Sampah *
            </Label>
            <Select value={formData.waste_type_id} onValueChange={(value) => setFormData({ ...formData, waste_type_id: value })}>
              <SelectTrigger className="border-green-200 focus:border-green-500" data-testid="waste-type-select">
                <SelectValue placeholder="Pilih jenis sampah" />
              </SelectTrigger>
              <SelectContent>
                {wasteTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id} data-testid={`waste-type-option-${type.id}`}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.name}</span>
                      <span className="ml-4 text-sm text-gray-500">
                        ({type.category === 'organic' ? 'Organik' : 'Non-Organik'})
                        {type.recyclable && ' ♻️'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedWasteType && (
              <p className="text-sm text-gray-600">
                Harga: ${selectedWasteType.price_per_kg} per kg
                {selectedWasteType.recyclable && ' • Dapat didaur ulang'}
              </p>
            )}
          </div>

          {/* Estimated Weight */}
          <div className="space-y-2">
            <Label htmlFor="estimated_weight" className="text-green-900 font-medium flex items-center">
              <Weight className="w-4 h-4 mr-2 text-green-600" />
              Estimasi Berat (kg) *
            </Label>
            <Input
              id="estimated_weight"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Contoh: 25"
              value={formData.estimated_weight}
              onChange={(e) => setFormData({ ...formData, estimated_weight: e.target.value })}
              className="border-green-200 focus:border-green-500"
              required
              data-testid="estimated-weight-input"
            />
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup_date" className="text-green-900 font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                Tanggal Pengambilan *
              </Label>
              <Input
                id="pickup_date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.pickup_date}
                onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                className="border-green-200 focus:border-green-500"
                required
                data-testid="pickup-date-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_time" className="text-green-900 font-medium">
                Waktu Pengambilan *
              </Label>
              <Input
                id="pickup_time"
                type="time"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                className="border-green-200 focus:border-green-500"
                required
                data-testid="pickup-time-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-900 font-medium">
              Catatan Tambahan (Opsional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Informasi tambahan untuk pengambilan sampah"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-green-200 focus:border-green-500"
              rows={3}
              data-testid="notes-input"
            />
          </div>

          {/* Price Estimate */}
          {estimatedPrice !== '0.00' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl" data-testid="price-estimate">
              <div className="flex justify-between items-center">
                <span className="text-green-900 font-medium">Estimasi Biaya:</span>
                <span className="text-2xl font-bold text-green-600">${estimatedPrice}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Biaya final akan dikonfirmasi setelah penimbangan aktual</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl"
            disabled={loading}
            data-testid="submit-booking-button"
          >
            {loading ? 'Memproses...' : 'Buat Pemesanan'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;