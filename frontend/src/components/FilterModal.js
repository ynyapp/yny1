import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { cuisineTypes } from '../mockData';

const FilterModal = ({ isOpen, onClose, filters, onFilterChange, onApply, onClear }) => {
  if (!isOpen) return null;

  const priceRanges = ['₺', '₺₺', '₺₺₺', '₺₺₺₺'];
  const ratings = [4.5, 4.0, 3.5, 3.0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Filtreler</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sort By */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Sıralama</h3>
              <div className="space-y-2">
                {[
                  { value: 'popularity', label: 'Popülerlik' },
                  { value: 'rating', label: 'En Yüksek Puan' },
                  { value: 'delivery_time', label: 'Teslimat Süresi' },
                  { value: 'cost_low', label: 'Düşük Fiyat' },
                  { value: 'cost_high', label: 'Yüksek Fiyat' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      filters.sortBy === option.value ? 'bg-red-50 border-2 border-red-600' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => onFilterChange('sortBy', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisines */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Mutfak Türü</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cuisineTypes.map((cuisine) => (
                  <div key={cuisine} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`modal-${cuisine}`}
                      checked={filters.selectedCuisines.includes(cuisine)}
                      onCheckedChange={() => {
                        const newCuisines = filters.selectedCuisines.includes(cuisine)
                          ? filters.selectedCuisines.filter(c => c !== cuisine)
                          : [...filters.selectedCuisines, cuisine];
                        onFilterChange('selectedCuisines', newCuisines);
                      }}
                    />
                    <label htmlFor={`modal-${cuisine}`} className="ml-3 text-gray-700 cursor-pointer flex-1">
                      {cuisine}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Minimum Puan</h3>
              <div className="space-y-2">
                {ratings.map((rating) => (
                  <label
                    key={rating}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      filters.minRating === rating ? 'bg-red-50 border-2 border-red-600' : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={filters.minRating === rating}
                      onChange={() => onFilterChange('minRating', rating)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">⭐ {rating}+</span>
                  </label>
                ))}
              </div>
            </div>

            {/* More Filters */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Daha Fazla Filtre</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Checkbox
                    id="pureVeg"
                    checked={filters.pureVeg}
                    onCheckedChange={(checked) => onFilterChange('pureVeg', checked)}
                  />
                  <span className="ml-3 text-gray-700">🥬 Vejeteryan</span>
                </label>
                
                <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Checkbox
                    id="openNow"
                    checked={filters.openNow}
                    onCheckedChange={(checked) => onFilterChange('openNow', checked)}
                  />
                  <span className="ml-3 text-gray-700">🕐 Şimdi Açık</span>
                </label>

                <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Checkbox
                    id="outdoorSeating"
                    checked={filters.outdoorSeating}
                    onCheckedChange={(checked) => onFilterChange('outdoorSeating', checked)}
                  />
                  <span className="ml-3 text-gray-700">🌳 Açık Hava Oturma</span>
                </label>

                <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Checkbox
                    id="petFriendly"
                    checked={filters.petFriendly}
                    onCheckedChange={(checked) => onFilterChange('petFriendly', checked)}
                  />
                  <span className="ml-3 text-gray-700">🐕 Evcil Hayvan Dostu</span>
                </label>

                <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Checkbox
                    id="servesAlcohol"
                    checked={filters.servesAlcohol}
                    onCheckedChange={(checked) => onFilterChange('servesAlcohol', checked)}
                  />
                  <span className="ml-3 text-gray-700">🍷 Alkol Servisi</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClear}
            className="px-6"
          >
            Temizle
          </Button>
          <Button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
          >
            Uygula
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
