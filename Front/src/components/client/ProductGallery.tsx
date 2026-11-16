import React, { useState } from 'react';
import { ProductImage } from '../../types/product';

export interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const fallbackImg =
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';
  const validImages = images && images.length > 0 ? images : [{ image_url: fallbackImg }];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImage = validImages[selectedIndex] || validImages[0];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[460px] scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={img.id || img.image_id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-rose-600 ring-2 ring-rose-200'
                  : 'border-neutral-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt={`${productName} miniatura ${idx + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-3xl bg-neutral-100 border border-neutral-200/80 shadow-sm">
        <img
          src={currentImage.image_url}
          alt={productName}
          className="h-full w-full object-cover object-center transition-all duration-300"
        />
      </div>
    </div>
  );
};
