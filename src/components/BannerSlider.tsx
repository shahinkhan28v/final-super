import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllBanners, getAppSettings, incrementBannerClick } from '../lib/dataService';
import { Banner, AppSettings } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      const [bData, sData] = await Promise.all([
        getAllBanners(),
        getAppSettings()
      ]);
      if (bData) {
        setBanners(bData.filter(b => b.isActive));
      }
      if (sData) {
        setSettings(sData);
      }
    }
    load();
  }, []);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const slidePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (settings?.bannerAutoSlide && banners.length > 1) {
      timerRef.current = setInterval(slideNext, (settings.bannerInterval || 7) * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, settings?.bannerAutoSlide, settings?.bannerInterval, slideNext]);

  if (banners.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.id) incrementBannerClick(banner.id);
  };

  return (
    <div className="relative w-full h-44 sm:h-56 overflow-hidden rounded-2xl group shadow-lg shadow-slate-200">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          {banners[currentIndex].linkUrl ? (
            <a 
              href={banners[currentIndex].linkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full h-full"
              onClick={() => handleBannerClick(banners[currentIndex])}
            >
              <img 
                src={banners[currentIndex].imageUrl} 
                alt={banners[currentIndex].title} 
                className="w-full h-full object-cover"
              />
            </a>
          ) : (
            <img 
              src={banners[currentIndex].imageUrl} 
              alt={banners[currentIndex].title} 
              className="w-full h-full object-cover"
            />
          )}

          {(banners[currentIndex].title || banners[currentIndex].description) && (
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
              <div className="space-y-1">
                {banners[currentIndex].type && (
                  <span className="text-[9px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded tracking-widest inline-block mb-1">
                    {banners[currentIndex].type}
                  </span>
                )}
                <h3 className="text-white font-bold text-lg sm:text-xl tracking-tight leading-tight">
                  {banners[currentIndex].title}
                </h3>
                {banners[currentIndex].description && (
                  <p className="text-white/80 text-xs sm:text-sm line-clamp-2 max-w-[80%]">
                    {banners[currentIndex].description}
                  </p>
                )}
                {banners[currentIndex].buttonText && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                      {banners[currentIndex].buttonText}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); slidePrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); slideNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
