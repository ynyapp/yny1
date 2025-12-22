import React, { useState, useEffect } from 'react';
import { Save, Globe, DollarSign, Truck, Phone, Mail, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const SettingsTab = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getSettings();
      setSettings(data);
    } catch (error) {
      toast({ title: "Hata", description: "Ayarlar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast({ title: "Başarılı", description: "Ayarlar kaydedildi" });
    } catch (error) {
      toast({ title: "Hata", description: "Ayarlar kaydedilemedi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-400" />
          Genel Ayarlar
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Adı</label>
            <Input
              value={settings?.siteName || ''}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
            <div className="flex gap-2">
              <Input
                value={settings?.currency || 'TRY'}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="flex-1"
              />
              <Input
                value={settings?.currencySymbol || '₺'}
                onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          Sipariş Ayarları
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min. Sipariş Tutarı (₺)</label>
            <Input
              type="number"
              value={settings?.minOrderAmount || 0}
              onChange={(e) => setSettings({...settings, minOrderAmount: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Varsayılan Teslimat Ücreti (₺)</label>
            <Input
              type="number"
              value={settings?.defaultDeliveryFee || 0}
              onChange={(e) => setSettings({...settings, defaultDeliveryFee: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Varsayılan Servis Ücreti (₺)</label>
            <Input
              type="number"
              value={settings?.defaultServiceFee || 0}
              onChange={(e) => setSettings({...settings, defaultServiceFee: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5 text-gray-400" />
          Teslimat Ayarları
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Teslimat Mesafesi (km)</label>
            <Input
              type="number"
              value={settings?.maxDeliveryRadius || 10}
              onChange={(e) => setSettings({...settings, maxDeliveryRadius: parseFloat(e.target.value) || 10})}
            />
          </div>
        </div>
      </div>

      {/* Support Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-400" />
          Destek Bilgileri
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Destek Email
            </label>
            <Input
              type="email"
              value={settings?.supportEmail || ''}
              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Destek Telefon
            </label>
            <Input
              value={settings?.supportPhone || ''}
              onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-2" /> Sıfırla
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Kaydediliyor...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Kaydet</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
