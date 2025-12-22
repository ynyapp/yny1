import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Calendar, Percent, X, Save, Copy, Check } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: null,
    userLimit: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCoupons();
      setCoupons(data || []);
    } catch (error) {
      toast({ title: "Hata", description: "Kuponlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };
      
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon.id, submitData);
        toast({ title: "Başarılı", description: "Kupon güncellendi" });
      } else {
        await adminAPI.createCoupon(submitData);
        toast({ title: "Başarılı", description: "Kupon oluşturuldu" });
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
    } catch (error) {
      toast({ title: "Hata", description: error.response?.data?.detail || "İşlem başarısız", variant: "destructive" });
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || null,
      usageLimit: coupon.usageLimit || null,
      userLimit: coupon.userLimit || 1,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      try {
        await adminAPI.deleteCoupon(id);
        toast({ title: "Başarılı", description: "Kupon silindi" });
        loadCoupons();
      } catch (error) {
        toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
      }
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      usageLimit: null,
      userLimit: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    });
  };

  const isExpired = (validUntil) => new Date(validUntil) < new Date();
  const isNotStarted = (validFrom) => new Date(validFrom) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setEditingCoupon(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Kupon
        </Button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          Henüz kupon oluşturulmamış
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
              !coupon.isActive ? 'border-gray-300 opacity-60' :
              isExpired(coupon.validUntil) ? 'border-red-500' :
              isNotStarted(coupon.validFrom) ? 'border-yellow-500' :
              'border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg bg-gray-100 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                    <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                      {copiedCode === coupon.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="font-medium mt-2">{coupon.name}</p>
                </div>
                <Tag className="w-5 h-5 text-red-500" />
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  <span>
                    {coupon.discountType === 'percentage' 
                      ? `%${coupon.discountValue} indirim`
                      : `${coupon.discountValue}₺ indirim`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(coupon.validFrom).toLocaleDateString('tr-TR')} - 
                    {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {coupon.minOrderAmount > 0 && (
                  <p>Min. sipariş: {coupon.minOrderAmount}₺</p>
                )}
                <p>Kullanım: {coupon.usedCount || 0}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  !coupon.isActive ? 'bg-gray-100 text-gray-600' :
                  isExpired(coupon.validUntil) ? 'bg-red-100 text-red-600' :
                  isNotStarted(coupon.validFrom) ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {!coupon.isActive ? 'Pasif' :
                   isExpired(coupon.validUntil) ? 'Süresi Doldu' :
                   isNotStarted(coupon.validFrom) ? 'Başlamadı' :
                   'Aktif'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(coupon)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="Boş bırakılırsa otomatik oluşturulur"
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Adı *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Yeni Üye İndirimi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Tipi</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İndirim Değeri *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Sipariş (₺)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. İndirim (₺)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="Sınırsız"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç *</label>
                  <Input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş *</label>
                  <Input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toplam Kullanım</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Sınırsız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Başı Limit</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.userLimit}
                    onChange={(e) => setFormData({...formData, userLimit: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm">Aktif</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
                <Button type="submit"><Save className="w-4 h-4 mr-2" /> Kaydet</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
