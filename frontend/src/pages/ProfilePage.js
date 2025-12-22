import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Package, Edit, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast({
      title: "Başarılı!",
      description: "Profil bilgileriniz güncellendi.",
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profilim</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="profile" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profil Bilgileri
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-2" />
              Adreslerim
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Ödeme Yöntemleri
            </TabsTrigger>
          </TabsList>

          {/* Profile Info Tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button
                      onClick={() => {
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || ''
                        });
                        setIsEditing(false);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Kaydet
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Adresler</h2>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Adres
                </Button>
              </div>
              
              <div className="space-y-4">
                {user?.addresses?.map(address => (
                  <div key={address.id} className="p-4 border rounded-lg hover:border-red-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{address.title}</h3>
                          {address.isDefault && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Kartlar</h2>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Kart
                </Button>
              </div>
              
              <div className="space-y-4">
                {user?.savedCards?.map(card => (
                  <div key={card.id} className="p-4 border rounded-lg hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{card.cardNumber}</p>
                          <p className="text-sm text-gray-600">{card.cardHolder}</p>
                          <p className="text-xs text-gray-500">Son kullanma: {card.expiryDate}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;