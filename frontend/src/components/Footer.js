import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="text-lg font-bold">Yemek Nerede Yenir</span>
            </div>
            <p className="text-gray-400 text-sm">
              Türkiye'nin en sevilen online yemek sipariş platformu.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Şirket</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Kariyer</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="font-semibold mb-4">Yardım</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">KVKK</Link></li>
            </ul>
          </div>

          {/* Restaurant Partners */}
          <div>
            <h3 className="font-semibold mb-4">İşletmeler İçin</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">Restoran Ekle</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Kurye Ol</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">İşletme Çözümleri</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Yemek Nerede Yenir. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;