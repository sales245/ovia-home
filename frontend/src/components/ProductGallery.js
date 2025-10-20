import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductGallery = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If only one image or array of images
  const imageArray = Array.isArray(images) ? images : [images];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageArray.length);
  };

  if (imageArray.length === 0 || !imageArray[0]) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  if (imageArray.length === 1) {
    return (
      <div className="relative w-full">
        <img
          src={imageArray[0]}
          alt={productName || 'Product'}
          className="w-full h-96 object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={imageArray[currentIndex]}
          alt={`${productName || 'Product'} - ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {imageArray.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {imageArray.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex ? 'border-primary' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
