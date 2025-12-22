import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const FeatureTag = ({ feature, variant = 'default', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/restaurants?feature=${encodeURIComponent(feature)}`);
  };

  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    pink: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${variants[variant]} ${className}`}
      title={`${feature} özelliğine sahip restoranları ara`}
    >
      <Check className="w-3.5 h-3.5" />
      <span>{feature}</span>
    </button>
  );
};

export default FeatureTag;
