"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Trash2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  // این تابع فایل‌های جدید را به فرم پدر می‌فرستد
  onFilesChange: (files: File[]) => void;
  // برای حالت ادیت (آدرس عکس‌های موجود)
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
}

export function ImageUpload({
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);

      // آپدیت استیت فایل‌ها
      const updatedFiles = [...newFiles, ...selectedFiles];
      setNewFiles(updatedFiles);
      onFilesChange(updatedFiles);

      // ساخت URL موقت برای نمایش پیش‌نمایش
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    // آزادسازی حافظه URL
    URL.revokeObjectURL(previews[index]);

    setNewFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* 1. نمایش عکس‌های قدیمی (از دیتابیس) */}
        {existingImages.map((url, index) => (
          <div
            key={`existing-${index}`}
            className="relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200"
          >
            <Image src={url} alt="Product" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {onRemoveExisting && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemoveExisting(url)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* 2. نمایش پیش‌نمایش عکس‌های جدید */}
        {previews.map((url, index) => (
          <div
            key={`new-${index}`}
            className="relative group w-32 h-32 rounded-xl overflow-hidden border border-blue-200"
          >
            <Image src={url} alt="New Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => removeNewFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* 3. دکمه آپلود */}
        <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 font-medium">افزودن عکس</span>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>
      <p className="text-xs text-gray-400">
        فرمت‌های مجاز: JPG, PNG, WebP. حداکثر ۵ مگابایت.
      </p>
    </div>
  );
}
