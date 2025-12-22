import React, { useState, useEffect } from 'react';
import { Plus, Key, Copy, Check, Trash2, Edit, X, Save, Eye, EyeOff, Shield } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const permissions = [
  { id: 'read', label: 'Okuma', description: 'Verileri görüntüleyebilir' },
  { id: 'write', label: 'Yazma', description: 'Veri oluşturabilir ve güncelleyebilir' },
  { id: 'delete', label: 'Silme', description: 'Verileri silebilir' },
  { id: 'admin', label: 'Admin', description: 'Tüm işlemleri yapabilir' }
];

const APIKeysTab = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: ['read'],
    rateLimit: 1000,
    allowedIPs: '',
    allowedOrigins: ''
  });

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAPIKeys();
      setApiKeys(data || []);
    } catch (error) {
      toast({ title: "Hata", description: "API anahtarları yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        allowedIPs: formData.allowedIPs ? formData.allowedIPs.split(',').map(s => s.trim()) : [],
        allowedOrigins: formData.allowedOrigins ? formData.allowedOrigins.split(',').map(s => s.trim()) : []
      };
      
      const response = await adminAPI.createAPIKey(submitData);
      setNewKeyData(response.api_key);
      toast({ title: "Başarılı", description: "API anahtarı oluşturuldu" });
      loadAPIKeys();
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu API anahtarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await adminAPI.deleteAPIKey(id);
        toast({ title: "Başarılı", description: "API anahtarı silindi" });
        loadAPIKeys();
      } catch (error) {
        toast({ title: "Hata", description: "Silme işlemi başarısız", variant: "destructive" });
      }
    }
  };

  const togglePermission = (permId) => {
    setFormData(prev => {
      const newPerms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: newPerms };
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: ['read'],
      rateLimit: 1000,
      allowedIPs: '',
      allowedOrigins: ''
    });
    setNewKeyData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          API anahtarları ile dış sistemlerin uygulamamıza erişmesini sağlayabilirsiniz.
        </p>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Yeni API Anahtarı
        </Button>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          Henüz API anahtarı oluşturulmamış
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Key className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{apiKey.description || 'Açıklama yok'}</p>
                    <div className="flex items-center gap-2 font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                      <span>{apiKey.key}</span>
                      <button 
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedKey === apiKey.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(apiKey.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {apiKey.permissions?.join(', ') || 'read'}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  Rate Limit: {apiKey.rateLimit}/saat
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  Kullanım: {apiKey.usageCount || 0}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  apiKey.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {apiKey.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {newKeyData ? 'API Anahtarı Oluşturuldu' : 'Yeni API Anahtarı'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {newKeyData ? (
              <div className="p-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ Bu bilgileri kaydedin! Secret key bir daha gösterilmeyecek.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
                      {newKeyData.key}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(newKeyData.key, 'key')}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedKey === 'key' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
                      {newKeyData.secret}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(newKeyData.secret, 'secret')}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedKey === 'secret' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button className="w-full" onClick={() => { setShowModal(false); resetForm(); }}>
                  Tamam
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anahtar Adı *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Mobil Uygulama API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Bu anahtar ne için kullanılacak?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yetkiler</label>
                  <div className="space-y-2">
                    {permissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{perm.label}</p>
                          <p className="text-xs text-gray-500">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (istek/saat)</label>
                  <Input
                    type="number"
                    min="100"
                    value={formData.rateLimit}
                    onChange={(e) => setFormData({...formData, rateLimit: parseInt(e.target.value) || 1000})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İzin Verilen IP'ler</label>
                  <Input
                    value={formData.allowedIPs}
                    onChange={(e) => setFormData({...formData, allowedIPs: e.target.value})}
                    placeholder="Virgülle ayırın (boş = tüm IP'ler)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>İptal</Button>
                  <Button type="submit"><Save className="w-4 h-4 mr-2" /> Oluştur</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default APIKeysTab;
