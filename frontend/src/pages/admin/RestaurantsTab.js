import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, MapPin, Star, Clock, 
  ChevronLeft, ChevronRight, X, Save, Image
} from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const RestaurantsTab = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    image: '',
    phone: '',
    priceRange: '$$',
    deliveryTime: '25-35 dk',
    minOrder: 50,
    deliveryFee: 10,
    isOpen: true,
    hasDelivery: true,
    hasTableBooking: false,
    location: {
      address: '',
      city: 'İstanbul',
      coordinates: { lat: 41.0082, lng: 28.9784 }
    }
  });

  useEffect(() => {
    loadRestaurants();
  }, [page, search]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getRestaurants(page, 10, search);
      setRestaurants(data.restaurants || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast({ title: "Hata", description: "Restoranlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await adminAPI.updateRestaurant(editingRestaurant.id, formData);
        toast({ title: "Başarılı", description: "Restoran güncellendi" });
      } else {
        await adminAPI.createRestaurant(formData);
        toast({ title: "Başarılı", description: "Restoran oluşturuldu" });
      }
      setShowModal(false);
      setEditingRestaurant(null);
      resetForm();
      loadRestaurants();
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      cuisine: restaurant.cuisine || '',
      description: restaurant.description || '',
      image: restaurant.image || '',
      phone: restaurant.phone || '',
      priceRange: restaurant.priceRange || '$$',
      deliveryTime: restaurant.deliveryTime || '25-35 dk',
      minOrder: restaurant.minOrder || 50,
      deliveryFee: restaurant.deliveryFee || 10,
      isOpen: restaurant.isOpen !== false,
      hasDelivery: restaurant.hasDelivery !== false,
      hasTableBooking: restaurant.hasTableBooking || false,
      location: restaurant.location || {
        address: '',
        city: 'İstanbul',
        coordinates: { lat: 41.0082, lng: 28.9784 }
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu restoranı silmek istediğinize emin misiniz?')) {
      try {
        await adminAPI.deleteRestaurant(id);
        toast({ title: "Başarılı", description: "Restoran silindi" });
        loadRestaurants();
      } catch (error) {
        toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cuisine: '',
      description: '',
      image: '',
      phone: '',
      priceRange: '$$',
      deliveryTime: '25-35 dk',
      minOrder: 50,
      deliveryFee: 10,
      isOpen: true,
      hasDelivery: true,
      hasTableBooking: false,
      location: {
        address: '',
        city: 'İstanbul',
        coordinates: { lat: 41.0082, lng: 28.9784 }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Restoran ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => { resetForm(); setEditingRestaurant(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Restoran
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restoran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mutfak</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sipariş</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Restoran bulunamadı
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={restaurant.image || 'https://via.placeholder.com/50'} 
                          alt={restaurant.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">{restaurant.priceRange}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{restaurant.cuisine}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{restaurant.location?.city || 'İstanbul'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{restaurant.rating || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{restaurant.orderCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.isOpen !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {restaurant.isOpen !== false ? 'Açık' : 'Kapalı'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(restaurant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(restaurant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Sayfa {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingRestaurant ? 'Restoran Düzenle' : 'Yeni Restoran'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restoran Adı *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Restoran adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mutfak Türü *</label>
                  <Input
                    required
                    value={formData.cuisine}
                    onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                    placeholder="Kebap, Pizza, vb."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  placeholder="Restoran açıklaması"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+90 212 000 00 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat Aralığı</label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="₺">₺ (Ekonomik)</option>
                    <option value="₺₺">₺₺ (Orta)</option>
                    <option value="₺₺₺">₺₺₺ (Pahalı)</option>
                    <option value="₺₺₺₺">₺₺₺₺ (Lüks)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Süresi</label>
                  <Input
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                    placeholder="25-35 dk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Sipariş (₺)</label>
                  <Input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({...formData, minOrder: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                  <Input
                    required
                    value={formData.location.address}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, address: e.target.value}
                    })}
                    placeholder="Tam adres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                  <Input
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, city: e.target.value}
                    })}
                    placeholder="İstanbul"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOpen}
                    onChange={(e) => setFormData({...formData, isOpen: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Açık</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDelivery}
                    onChange={(e) => setFormData({...formData, hasDelivery: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Teslimat Var</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasTableBooking}
                    onChange={(e) => setFormData({...formData, hasTableBooking: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Rezervasyon Var</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingRestaurant ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantsTab;
