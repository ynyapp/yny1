import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Check, X, MapPin, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'preparing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'on-the-way':
        return 'Yolda';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'preparing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'on-the-way':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Siparişlerim</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz Sipariş Yok</h2>
            <p className="text-gray-600 mb-6">Henüz hiç sipariş vermediniz.</p>
            <Button
              onClick={() => navigate('/restaurants')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sipariş Vermeye Başla
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-sm">{getStatusText(order.status)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Sipariş #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{order.total}₺</p>
                      <p className="text-sm text-gray-600">Toplam Tutar</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Ürünler:</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm text-gray-700">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-semibold">{item.price}₺</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    {order.status === 'delivered' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Değerlendirin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Tekrar Sipariş Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      Detaylar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default OrdersPage;