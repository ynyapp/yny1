import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Megaphone, Calendar, Eye, BarChart2, X, Save, Image } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const campaignTypes = {
  banner: 'Banner',
  popup: 'Popup',
  notification: 'Bildirim',
  email: 'Email',
  sms: 'SMS'
};

const CampaignsTab = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    image: '',
    campaignType: 'banner',
    targetAudience: 'all',
    discountType: null,
    discountValue: null,
    couponCode: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    priority: 0,
    showOnHomepage: true
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCampaigns();
      setCampaigns(data || []);
    } catch (error) {
      toast({ title: "Hata", description: "Kampanyalar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      if (editingCampaign) {
        await adminAPI.updateCampaign(editingCampaign.id, submitData);
        toast({ title: "Başarılı", description: "Kampanya güncellendi" });
      } else {
        await adminAPI.createCampaign(submitData);
        toast({ title: "Başarılı", description: "Kampanya oluşturuldu" });
      }
      setShowModal(false);
      setEditingCampaign(null);
      resetForm();
      loadCampaigns();
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      campaignType: campaign.campaignType,
      targetAudience: campaign.targetAudience || 'all',
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      couponCode: campaign.couponCode || '',
      startDate: new Date(campaign.startDate).toISOString().split('T')[0],
      endDate: new Date(campaign.endDate).toISOString().split('T')[0],
      isActive: campaign.isActive,
      priority: campaign.priority || 0,
      showOnHomepage: campaign.showOnHomepage !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
      try {
        await adminAPI.deleteCampaign(id);
        toast({ title: "Başarılı", description: "Kampanya silindi" });
        loadCampaigns();
      } catch (error) {
        toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
      }
    }
  };

  const viewAnalytics = async (campaign) => {
    try {
      const data = await adminAPI.getCampaignAnalytics(campaign.id);
      setShowAnalytics({ campaign, analytics: data });
    } catch (error) {
      toast({ title: "Hata", description: "Analitik veriler yüklenemedi", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      image: '',
      campaignType: 'banner',
      targetAudience: 'all',
      discountType: null,
      discountValue: null,
      couponCode: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      priority: 0,
      showOnHomepage: true
    });
  };

  const isActive = (campaign) => {
    const now = new Date();
    return campaign.isActive && 
           new Date(campaign.startDate) <= now && 
           new Date(campaign.endDate) >= now;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => { resetForm(); setEditingCampaign(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Kampanya
        </Button>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          Henüz kampanya oluşturulmamış
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {campaign.image && (
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isActive(campaign) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isActive(campaign) ? 'Aktif' : 'Pasif'}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-600 ml-2">
                      {campaignTypes[campaign.campaignType] || campaign.campaignType}
                    </span>
                  </div>
                  <Megaphone className="w-5 h-5 text-red-500" />
                </div>

                <h3 className="font-bold text-lg mb-1">{campaign.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString('tr-TR')} - 
                      {new Date(campaign.endDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{campaign.impressionCount || 0} görüntülenme</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <span>{campaign.clickCount || 0} tıklama</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <button onClick={() => viewAnalytics(campaign)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(campaign)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(campaign.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="İç kullanım için"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Kullanıcılara gösterilecek başlık"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Kampanya açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel URL *</label>
                <Input
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Tipi</label>
                  <select
                    value={formData.campaignType}
                    onChange={(e) => setFormData({...formData, campaignType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {Object.entries(campaignTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç *</label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş *</label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kupon Kodu (Opsiyonel)</label>
                <Input
                  value={formData.couponCode}
                  onChange={(e) => setFormData({...formData, couponCode: e.target.value})}
                  placeholder="Kampanyaya bağlı kupon kodu"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({...formData, showOnHomepage: e.target.checked})}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Ana Sayfada Göster</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
                <Button type="submit"><Save className="w-4 h-4 mr-2" /> Kaydet</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Kampanya Analitiği</h3>
              <button onClick={() => setShowAnalytics(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <h4 className="font-medium">{showAnalytics.campaign.title}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{showAnalytics.analytics.impressions}</p>
                  <p className="text-sm text-gray-500">Görüntülenme</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{showAnalytics.analytics.clicks}</p>
                  <p className="text-sm text-gray-500">Tıklama</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">%{showAnalytics.analytics.ctr?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">CTR</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{showAnalytics.analytics.orders}</p>
                  <p className="text-sm text-gray-500">Sipariş</p>
                </div>
              </div>

              {showAnalytics.analytics.revenue > 0 && (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{showAnalytics.analytics.revenue.toLocaleString()}₺</p>
                  <p className="text-sm text-green-600">Toplam Gelir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;
