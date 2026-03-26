import React, { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  fallbackNode: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
};

const FallbackImage = ({ src, alt, fallbackNode, className, style }: Props) => {
  const [imgError, setImgError] = useState(false);
  if (!src || imgError) return <div className={`flex items-center justify-center ${className}`} style={style}>{fallbackNode}</div>;
  return <img src={src} alt={alt} className={className} style={style} onError={() => setImgError(true)} />;
};

export default FallbackImage;
