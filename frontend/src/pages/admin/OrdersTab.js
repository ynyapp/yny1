import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Clock, CheckCircle, XCircle, Truck, 
  ChevronLeft, ChevronRight, X, Phone, MapPin, Package
} from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  'on-the-way': 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  preparing: 'Hazırlanıyor',
  'on-the-way': 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getOrders(page, 15, statusFilter || undefined);
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast({ title: "Hata", description: "Siparişler yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast({ title: "Başarılı", description: "Sipariş durumu güncellendi" });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast({ title: "Hata", description: "Durum güncellenemedi", variant: "destructive" });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            Sipariş bulunamadı
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p><strong>Restoran:</strong> {order.restaurantName || 'Bilinmiyor'}</p>
                    <p><strong>Tarih:</strong> {formatDate(order.createdAt)}</p>
                    <p><strong>Ürünler:</strong> {order.items?.length || 0} ürün</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{order.total?.toLocaleString()}₺</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 mr-1" /> Detay
                    </Button>
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'confirmed')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'preparing')}>
                        <Package className="w-4 h-4 mr-1" /> Hazırla
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'on-the-way')}>
                        <Truck className="w-4 h-4 mr-1" /> Yola Çık
                      </Button>
                    )}
                    {order.status === 'on-the-way' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(order.id, 'delivered')}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Teslim Et
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">Sayfa {page} / {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Sipariş #{selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Durum</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-3">Ürünler</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">{(item.price * item.quantity).toLocaleString()}₺</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>{selectedOrder.subtotal?.toLocaleString()}₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Teslimat</span>
                  <span>{selectedOrder.deliveryFee?.toLocaleString()}₺</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Toplam</span>
                  <span>{selectedOrder.total?.toLocaleString()}₺</span>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Teslimat Adresi
                  </h4>
                  <p className="text-gray-600 text-sm">{selectedOrder.deliveryAddress.address}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => { updateStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> İptal Et
                  </Button>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                  Kapat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
