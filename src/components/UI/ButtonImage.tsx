import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BotonImagenProps {
  imagenUrl: string;
  redirectUrl: string;
  altText?: string;
  className?: string;
  style?: object;
}

export const BotonImagen: React.FC<BotonImagenProps> = (
  {
    imagenUrl,
    redirectUrl,
    altText = "Botón con imagen",
    className = "",
    style 

  }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Redirección interna para SPA
    if (redirectUrl.startsWith('/')) {
      navigate(redirectUrl);
    } else {
      // Redirección externa
      window.location.href = redirectUrl;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-24 md:h-32 lg:h-40 ${className}`}
      style={{        
        backgroundImage: `url(${imagenUrl})`,
         backgroundSize: 'cover',        
        backgroundPosition: 'center', ...style              
      }}
      aria-label={altText}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity duration-300" />
    </button>
  );
};

export default BotonImagen;