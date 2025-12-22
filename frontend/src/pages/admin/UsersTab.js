import React, { useState, useEffect } from 'react';
import { Search, Shield, ShieldCheck, Eye, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { adminAPI } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '../../hooks/use-toast';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers(page, 15, search || undefined);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      toast({ title: "Hata", description: "Kullanıcılar yüklenemedi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (user) => {
    try {
      const data = await adminAPI.getUserDetails(user.id);
      setUserDetails(data);
      setSelectedUser(user);
    } catch (error) {
      toast({ title: "Hata", description: "Kullanıcı detayları yüklenemedi", variant: "destructive" });
    }
  };

  const makeAdmin = async (userId) => {
    if (window.confirm('Bu kullanıcıyı admin yapmak istediğinize emin misiniz?')) {
      try {
        await adminAPI.makeUserAdmin(userId);
        toast({ title: "Başarılı", description: "Kullanıcı admin yapıldı" });
        loadUsers();
      } catch (error) {
        toast({ title: "Hata", description: "İşlem başarısız", variant: "destructive" });
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="İsim, email veya telefon ara..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Siparişler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Kullanıcı bulunamadı</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold">{user.name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'İsimsiz'}</p>
                          <p className="text-sm text-gray-500">{user.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{user.orderCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="flex items-center gap-1 text-purple-600">
                          <ShieldCheck className="w-4 h-4" /> Admin
                        </span>
                      ) : (
                        <span className="text-gray-500">Kullanıcı</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => viewUserDetails(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!user.is_admin && (
                          <button 
                            onClick={() => makeAdmin(user.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Admin Yap"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">Sayfa {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && userDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Kullanıcı Detayı</h3>
              <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-2xl">{userDetails.user?.name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold">{userDetails.user?.name || 'İsimsiz'}</h4>
                  {userDetails.user?.is_admin && (
                    <span className="inline-flex items-center gap-1 text-purple-600 text-sm">
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{userDetails.user?.email}</span>
                </div>
                {userDetails.user?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{userDetails.user?.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{userDetails.stats?.total_orders || 0}</p>
                  <p className="text-sm text-gray-500">Sipariş</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{(userDetails.stats?.total_spent || 0).toLocaleString()}₺</p>
                  <p className="text-sm text-gray-500">Toplam Harcama</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{userDetails.stats?.total_reviews || 0}</p>
                  <p className="text-sm text-gray-500">Değerlendirme</p>
                </div>
              </div>

              {/* Recent Orders */}
              {userDetails.orders?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Son Siparişler</h4>
                  <div className="space-y-2">
                    {userDetails.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex justify-between py-2 border-b">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <p className="font-medium">{order.total?.toLocaleString()}₺</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
