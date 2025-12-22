import React from 'react';
import { useNavigate } from 'react-router-dom';

const collections = [
  {
    id: 1,
    title: 'En İyi Kebapçılar',
    count: 12,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80',
  },
  {
    id: 2,
    title: 'Trend Restoranlar',
    count: 18,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  },
  {
    id: 3,
    title: 'Romantik Akşam Yemekleri',
    count: 8,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  },
  {
    id: 4,
    title: 'Kahvaltı Keyfi',
    count: 15,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
  },
];

const Collections = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Koleksiyonlar</h2>
      <p className="text-gray-600 mb-6">Şehrin en iyi restoranlarını keşfedin</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            onClick={() => navigate(`/collection/${collection.id}`)}
            className="relative h-72 rounded-xl overflow-hidden cursor-pointer group"
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
  );
};

export default Collections;
