 import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CaretLeft, CaretRight, Clock, Power } from '@phosphor-icons/react';

interface Slide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  icon?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: 'Experience the Speed and Value You Deserve',
    subtitle: 'Transfer Funds to your Loved Ones in Africa. Fast, Secure and Absolutely Free.'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: 'Send money across borders.',
    subtitle: 'We are a trusted remittance service that charges zero fees and offers superior exchange rates.'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: '💎 Zero Fees',
    subtitle: 'We believe in fairness and transparency. That\'s why we charge zero fees on all transactions.'
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: '💱 Superior Exchange Rates',
    subtitle: 'We offer the most competitive exchange rates in the market. With us, your money goes further.'
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: '⏱ Fast & Reliable',
    subtitle: 'We understand that your money is important. That\'s why we ensure it gets to where it needs to be, quickly and securely.'
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1563207153-f403bf289096?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: '🛡 Safe & Secure',
    subtitle: 'Your security is our priority. We use state-of-the-art technology to protect your transactions and ensure your peace of mind.'
  },
  {
    id: 7,
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200&q=85',
    title: 'Fast, Reliable and Secure Transactions',
    subtitle: 'at the Speed of Trust.'
  }
];

interface FinancialCarouselProps {
  className?: string;
  autoSlideDelay?: number;
  isStandbyMode?: boolean;
  onWakeUp?: () => void;
}

const FinancialCarousel: React.FC<FinancialCarouselProps> = ({ 
  className = '',
  autoSlideDelay = 5000,
  isStandbyMode = false,
  onWakeUp
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [textKey, setTextKey] = useState(0); // Key for text animations
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mobile touch handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Update current time every second (for standby mode)
  useEffect(() => {
    if (!isStandbyMode) return;
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isStandbyMode]);

  // Auto-slide functionality with text animations
  useEffect(() => {
    if (!isAutoSliding) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Start text exit animation
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTextKey(prev => prev + 1); // Trigger text re-animation
        setIsTransitioning(false);
      }, 300); // Wait for exit animation
    }, autoSlideDelay);

    return () => clearInterval(interval);
  }, [autoSlideDelay, isAutoSliding]);

  const goToSlide = (slideIndex: number) => {
    if (slideIndex === currentSlide) return;
    
    setIsTransitioning(true);
    setIsAutoSliding(false);
    
    setTimeout(() => {
      setCurrentSlide(slideIndex);
      setTextKey(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
    
    // Resume auto-sliding after user interaction
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setIsAutoSliding(false);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTextKey(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
    
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setIsAutoSliding(false);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTextKey(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
    
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped left - go to next slide
      goToNext();
    } else {
      // Swiped right - go to previous slide
      goToPrevious();
    }
  };

  const handleWakeUp = () => {
    if (onWakeUp) {
      onWakeUp();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get responsive image URL based on screen size
  const getResponsiveImageUrl = (baseUrl: string) => {
    // Extract the base URL without size parameters
    const urlParts = baseUrl.split('?')[0];
    const params = new URLSearchParams(baseUrl.split('?')[1] || '');
    
    // Set responsive parameters
    if (window.innerWidth <= 640) {
      // Mobile: smaller, optimized images
      params.set('w', '1200');
      params.set('h', '800');
      params.set('q', '80');
    } else if (window.innerWidth <= 1024) {
      // Tablet: medium images
      params.set('w', '1600');
      params.set('h', '1000');
      params.set('q', '85');
    } else {
      // Desktop: high-resolution images
      params.set('w', '2000');
      params.set('h', '1200');
      params.set('q', '85');
    }
    
    return `${urlParts}?${params.toString()}`;
  };

  // Render standby mode (fullscreen)
  if (isStandbyMode) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer standby-carousel h-screen w-screen"
        onClick={handleWakeUp}
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0 transition-all duration-1000 ease-in-out overflow-hidden">
          <img
            src={getResponsiveImageUrl(slides[currentSlide].imageUrl)}
            alt={slides[currentSlide].title}
            className="carousel-image-fit opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-white space-y-10 px-8 max-w-6xl w-full">
          {/* Branding Header */}
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-montserrat drop-shadow-2xl">RJB TRANZ</div>
            <div className="text-xs sm:text-sm lg:text-base text-gray-300 font-montserrat drop-shadow-lg mt-2">
              Professional Money Exchange & Remittance CRM System
            </div>
          </div>

          {/* Carousel Content with Enhanced Animations */}
          <div className="space-y-6 text-center sm:text-left">
            <div 
              key={`title-${textKey}`}
              className={`transition-all duration-500 ease-out ${
                isTransitioning 
                  ? 'opacity-0 transform translate-y-4 scale-95' 
                  : 'opacity-100 transform translate-y-0 scale-100 animate-text-slide-in'
              }`}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold font-montserrat leading-tight drop-shadow-2xl">
                {slides[currentSlide].title}
              </h1>
            </div>
            
            <div 
              key={`subtitle-${textKey}`}
              className={`transition-all duration-700 ease-out ${
                isTransitioning 
                  ? 'opacity-0 transform translate-y-6 scale-95' 
                  : 'opacity-100 transform translate-y-0 scale-100 animate-text-slide-in-delayed'
              }`}
            >
              <h2 className="text-base sm:text-xl lg:text-2xl font-normal font-montserrat leading-relaxed opacity-90 drop-shadow-xl max-w-4xl mx-auto sm:mx-0">
                {slides[currentSlide].subtitle}
              </h2>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3 mt-12">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide 
                    ? 'bg-white w-12 h-3 shadow-lg' 
                    : 'bg-white/40 w-3 h-3 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Wake Up Instructions */}
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gray-400 font-montserrat animate-pulse mt-8">
            <Clock className="h-5 w-5" />
            <span>Click anywhere or press any key to return to CRM</span>
          </div>
        </div>

        {/* Wake Up Button */}
        <button
          onClick={handleWakeUp}
          className="fixed bottom-8 right-8 z-20 bg-primary/20 backdrop-blur-md border border-white/20 hover:bg-primary/30 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-montserrat"
        >
          <Power className="h-5 w-5 mr-2 inline" />
          Wake Up
        </button>

        {/* Auto-slide Progress Bar */}
        {isAutoSliding && !isTransitioning && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{
                animation: `carousel-progress ${autoSlideDelay}ms linear infinite`
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Regular carousel mode
  return (
    <Card className={`overflow-hidden relative ${className} carousel-card-enhanced dashboard-card-glow`}>
      <div 
        className="carousel-container relative h-80 sm:h-96 lg:h-[28rem]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image with Enhanced Fitting */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <img
            src={getResponsiveImageUrl(slides[currentSlide].imageUrl)}
            alt={slides[currentSlide].title}
            className="carousel-image-fit transition-all duration-1000 ease-in-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Navigation Arrows - Hidden on Mobile */}
        <button
          onClick={goToPrevious}
          className="carousel-nav-button absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group backdrop-blur-sm border border-white/10 hidden sm:block"
          aria-label="Previous slide"
        >
          <CaretLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" weight="bold" />
        </button>

        <button
          onClick={goToNext}
          className="carousel-nav-button absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 group backdrop-blur-sm border border-white/10 hidden sm:block"
          aria-label="Next slide"
        >
          <CaretRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" weight="bold" />
        </button>

        {/* Content Overlay with Enhanced Text Animations */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 lg:px-12 z-10 financial-carousel">
          <div className="max-w-3xl">
            <div 
              key={`title-${textKey}`}
              className={`transition-all duration-500 ease-out ${
                isTransitioning 
                  ? 'opacity-0 transform translate-y-4 scale-95' 
                  : 'opacity-100 transform translate-y-0 scale-100 animate-text-slide-in'
              }`}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight font-montserrat drop-shadow-lg">
                {slides[currentSlide].title}
              </h1>
            </div>
            
            <div 
              key={`subtitle-${textKey}`}
              className={`transition-all duration-700 ease-out ${
                isTransitioning 
                  ? 'opacity-0 transform translate-y-6 scale-95' 
                  : 'opacity-100 transform translate-y-0 scale-100 animate-text-slide-in-delayed'
              }`}
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl text-white/90 font-normal leading-relaxed font-montserrat drop-shadow-md">
                {slides[currentSlide].subtitle}
              </h2>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="mobile-swipe-hint sm:hidden">
          <span>👈 Swipe to navigate 👉</span>
        </div>

        {/* Slide Indicators - Hidden on mobile */}
        <div className="carousel-indicators absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10 hidden sm:flex">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-indicator transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'bg-white w-8 h-2 shadow-lg active'
                  : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-slide Progress Bar */}
        {isAutoSliding && !isTransitioning && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{
                animation: `carousel-progress ${autoSlideDelay}ms linear infinite`
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default FinancialCarousel;