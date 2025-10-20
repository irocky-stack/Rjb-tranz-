import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

interface SessionTimeoutCarouselProps {
  onClose: () => void;
}

const SessionTimeoutCarousel: React.FC<SessionTimeoutCarouselProps> = ({ onClose }) => {
  // Finance-related images from Unsplash and Freepik
  const images = [
    { src: 'https://source.unsplash.com/featured/?finance,money,800x600', alt: 'Finance and Money' },
    { src: 'https://source.unsplash.com/featured/?banking,800x600', alt: 'Banking Services' },
    { src: 'https://source.unsplash.com/featured/?investment,800x600', alt: 'Investment Planning' },
    { src: 'https://source.unsplash.com/featured/?currency,exchange,800x600', alt: 'Currency Exchange' },
    { src: 'https://source.unsplash.com/featured/?remittance,transfer,800x600', alt: 'Money Transfer' },
    { src: 'https://source.unsplash.com/featured/?financial,planning,800x600', alt: 'Financial Planning' },
    { src: 'https://source.unsplash.com/featured/?business,finance,800x600', alt: 'Business Finance' },
    { src: 'https://source.unsplash.com/featured/?wealth,management,800x600', alt: 'Wealth Management' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
        >
          ✕
        </button>

        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
            }),
            Fade()
          ]}
          className="w-full"
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-opacity duration-1000"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded">
                    {index + 1} / {images.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div className="mt-4 text-center text-white">
          <p className="text-lg font-semibold mb-2">Session Timeout</p>
          <p className="text-sm opacity-80">Your session will expire soon. Please interact with the app to continue.</p>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutCarousel;