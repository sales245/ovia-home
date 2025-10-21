import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = ({ slides, autoPlayInterval = 5000, language }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [currentSlide, isPaused, slides.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full h-96 overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title[language] || slide.title.en || 'Slide'}
            className="w-full h-full object-cover"
          />
          
          {/* Stronger Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
          
          {/* Content - Positioned away from navigation arrows */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-16 md:px-20">
              <div className="max-w-2xl text-white">
                {slide.subtitle && (
                  <p className="text-sm md:text-base font-bold mb-3 text-white uppercase tracking-wider animate-fade-in bg-primary px-4 py-1 inline-block rounded">
                    {slide.subtitle[language] || slide.subtitle.en}
                  </p>
                )}
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 leading-tight text-white" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8)'}}>
                  {slide.title[language] || slide.title.en}
                </h2>
                {slide.description && (
                  <p className="text-lg md:text-2xl mb-10 text-white leading-relaxed font-medium" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.8)'}}>
                    {slide.description[language] || slide.description.en}
                  </p>
                )}
                {slide.buttonText && slide.buttonLink && (
                  <a
                    href={slide.buttonLink}
                    className="inline-block bg-white text-primary hover:bg-primary hover:text-white font-bold px-10 py-5 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-2 text-lg"
                  >
                    {slide.buttonText[language] || slide.buttonText.en}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
