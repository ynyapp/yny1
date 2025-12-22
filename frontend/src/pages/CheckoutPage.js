import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, Banknote, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [selectedAddress, setSelectedAddress] = useState('a1');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryFee = 10;
  const serviceFee = 5;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee + serviceFee;

  const handlePlaceOrder = () => {
    // Mock order placement
    setOrderPlaced(true);
    toast({
      title: "Sipariş Alındı!",
      description: "Siparişiniz başarıyla oluşturuldu.",
    });
    
    setTimeout(() => {
      clearCart();
      navigate('/orders');
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Oluşturuldu!</h2>
            <p className="text-gray-600 mb-6">Siparişiniz hazırlanıyor.</p>
            <p className="text-sm text-gray-500">Siparişlerim sayfasına yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sepete Dön
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Siparişi Tamamla</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Teslimat Adresi
              </h2>
              <div className="space-y-3">
                {user?.addresses?.map(address => (
                  <label
                    key={address.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === address.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{address.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                      </div>
                      {address.isDefault && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Varsayılan
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-red-600" />
                Ödeme Yöntemi
              </h2>
              <div className="space-y-3">
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'credit-card'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Kredi/Banka Kartı</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Banknote className="w-5 h-5 mr-3 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Kapıda Nakit Ödeme</p>
                      <p className="text-sm text-gray-600">Siparişi teslim alırken ödeyin</p>
                    </div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'credit-card' && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <Input placeholder="Kart Numarası" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="AA/YY" />
                    <Input placeholder="CVV" />
                  </div>
                  <Input placeholder="Kart Üzerindeki İsim" />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                    <span className="font-semibold">{(item.price * item.quantity).toFixed(2)}₺</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Teslimat Ücreti</span>
                  <span>{deliveryFee.toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Hizmet Bedeli</span>
                  <span>{serviceFee.toFixed(2)}₺</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Toplam</span>
                    <span>{total.toFixed(2)}₺</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
              >
                Siparişi Onayla
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;