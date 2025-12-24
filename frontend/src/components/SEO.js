import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Yemek Nerede Yenir - En İyi Restoranlar ve Yemek Siparişi',
  description = 'Türkiye\'nin en iyi restoranlarından online yemek siparişi verin. Yakınızdaki restoranları keşfedin, özel indirimleri kaçırmayın.',
  keywords = 'yemek siparişi, restoran, online sipariş, yemek, teslimat, dine-in, rezervasyon',
  ogImage = 'https://foodspotter-tr.preview.emergentagent.com/og-image.jpg',
  ogUrl = 'https://foodspotter-tr.preview.emergentagent.com',
  type = 'website'
}) => {
  const siteName = 'Yemek Nerede Yenir';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Yemek Nerede Yenir" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#DC2626" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  );
};

export default SEO;
