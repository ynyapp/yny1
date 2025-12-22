import React from 'react';
import { useNavigate } from 'react-router-dom';

const collections = [
  {
    id: 1,
    title: 'Yılbaşı Özel Menüleri',
    count: 19,
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&q=80',
  },
  {
    id: 2,
    title: 'En İyi Kebapçılar',
    count: 12,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80',
  },
  {
    id: 3,
    title: 'Trend Restoranlar',
    count: 26,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  },
  {
    id: 4,
    title: 'Romantik Akşam Yemekleri',
    count: 15,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  },
  {
    id: 5,
    title: 'Kahvaltı Keyfi',
    count: 18,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
  },
  {
    id: 6,
    title: 'En İyi Yemek Fırsatları',
    count: 28,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
  },
  {
    id: 7,
    title: 'Şehrin Yeni Mekanları',
    count: 8,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
  },
  {
    id: 8,
    title: 'Michelin Yıldızlı',
    count: 12,
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&q=80',
  },
  {
    id: 9,
    title: 'Lüks Akşam Yemekleri',
    count: 22,
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
  },
  {
    id: 10,
    title: 'Gizli Hazineler',
    count: 14,
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80',
  },
];

const Collections = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Koleksiyonlar</h2>
          <p className="text-gray-600">Şehrin en iyi restoranlarını keşfedin</p>
        </div>
        <button 
          onClick={() => navigate('/collections')}
          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
        >
          Tümünü Gör
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {collections.map((collection) => (
            <div
              key={collection.id}
              onClick={() => navigate(`/collection/${collection.id}`)}
              className="relative min-w-[280px] h-72 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 snap-start"
            >
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold mb-1">{collection.title}</h3>
                <p className="text-sm opacity-90">{collection.count} Mekan</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collections;
