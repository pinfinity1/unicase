"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // سینک کردن کاروسل با استیت (وقتی کاربر ورق می‌زند)
  useEffect(() => {
    if (!api) {
      return;
    }

    // وقتی اسلاید تغییر کرد، این تابع اجرا میشه
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // وقتی روی تامنیل کلیک شد
  const handleThumbnailClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (!images.length) return null;

  return (
    <div className="flex flex-col gap-4" dir="ltr">
      {/* نکته: dir=ltr گذاشتم تا جهت ورق زدن با منطق Next/Prev قاطی نشه، چون Embla گاهی با RTL اذیت میکنه */}

      {/* 1. اسلایدر اصلی */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-gray-100">
                <Image
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0} // فقط عکس اول با اولویت لود شه
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* دکمه‌های چپ و راست (اختیاری - اگر دوست داشتی برش دار) */}
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>

      {/* 2. لیست تصاویر کوچک (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 px-1 justify-center sm:justify-start">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                current === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
