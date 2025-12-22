import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Store, ShoppingCart, Users, Tag, Megaphone, 
  Key, Settings, LogOut, Menu, X, Bell, ChevronDown, Star,
  TrendingUp, DollarSign, Package, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../api';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restoranlar', icon: Store },
    { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'coupons', label: 'Kuponlar', icon: Tag },
    { id: 'campaigns', label: 'Kampanyalar', icon: Megaphone },
    { id: 'reservations', label: 'Rezervasyonlar', icon: Calendar },
    { id: 'api-keys', label: 'API Anahtarları', icon: Key },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-red-600">YNY Admin</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-200`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 hidden lg:block">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Siteye Git
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>

      <Toaster />
    </div>
  );
};

// Dashboard Component
const DashboardTab = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Hata",
        description: "Analitik veriler yüklenemedi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Toplam Restoran', value: analytics?.summary?.total_restaurants || 0, icon: Store, color: 'blue' },
    { label: 'Toplam Sipariş', value: analytics?.summary?.total_orders || 0, icon: ShoppingCart, color: 'green' },
    { label: 'Toplam Kullanıcı', value: analytics?.summary?.total_users || 0, icon: Users, color: 'purple' },
    { label: 'Toplam Gelir', value: `${(analytics?.summary?.total_revenue || 0).toLocaleString()}₺`, icon: DollarSign, color: 'red' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bugünün İstatistikleri</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{analytics?.today?.orders || 0}</p>
              <p className="text-sm text-gray-500">Sipariş</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{(analytics?.today?.revenue || 0).toLocaleString()}₺</p>
              <p className="text-sm text-gray-500">Gelir</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumları</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.orders_by_status || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{status}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3">Sipariş No</th>
                <th className="pb-3">Tutar</th>
                <th className="pb-3">Durum</th>
                <th className="pb-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recent_orders?.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3">{order.total?.toLocaleString()}₺</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Restaurants */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Sipariş Alan Restoranlar</h3>
        <div className="space-y-4">
          {analytics?.top_restaurants?.map((restaurant, index) => (
            <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="font-medium">{restaurant.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{restaurant.revenue?.toLocaleString()}₺</p>
                <p className="text-sm text-gray-500">{restaurant.orders} sipariş</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Admin Page
export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
      </div>
    );
  }

  // Redirect handled by useEffect
  if (!isAuthenticated) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'restaurants':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Restoran yönetimi yakında...</p></div>;
      case 'orders':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Sipariş yönetimi yakında...</p></div>;
      case 'users':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Kullanıcı yönetimi yakında...</p></div>;
      case 'coupons':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Kupon yönetimi yakında...</p></div>;
      case 'campaigns':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Kampanya yönetimi yakında...</p></div>;
      case 'reservations':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Rezervasyon yönetimi yakında...</p></div>;
      case 'api-keys':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">API anahtar yönetimi yakında...</p></div>;
      case 'settings':
        return <div className="bg-white rounded-xl shadow-sm p-6"><p className="text-gray-500">Ayarlar yakında...</p></div>;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </AdminLayout>
  );
}
