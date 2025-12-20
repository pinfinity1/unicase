"use client";

import { useState, useEffect, useActionState } from "react";
import { createProduct, updateProduct } from "@/actions/products";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brand, Category } from "@prisma/client";
import { ProductClient } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import { X, Plus, Image as ImageIcon, Trash2, Palette } from "lucide-react";

interface ProductFormProps {
  categories: Category[];
  brands: Brand[];
  initialData?: ProductClient | null;
  onSuccess?: () => void;
}

type VariantItem = {
  name: string;
  colorCode: string;
  stock: number;
  priceDiff: number;
  imageIndex: number | null; // ایندکس عکس در گالری بالا
};

export function ProductForm({
  categories,
  brands,
  initialData,
  onSuccess,
}: ProductFormProps) {
  const isEditMode = !!initialData;
  const action = isEditMode
    ? updateProduct.bind(null, initialData.id)
    : createProduct;
  const [state, formAction, isPending] = useActionState(action, {
    message: "",
    success: false,
  });

  // --- مدیریت تصاویر ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<
    { url: string; isExisting: boolean }[]
  >(initialData?.images?.map((img) => ({ url: img, isExisting: true })) || []);

  // --- مدیریت واریانت‌ها ---
  const [variants, setVariants] = useState<VariantItem[]>(
    (initialData as any)?.variants?.map((v: any) => ({
      ...v,
      // پیدا کردن ایندکس عکس فعلی در گالری برای نمایش در Select
      imageIndex:
        initialData?.images?.indexOf(v.imageUrl!) !== -1
          ? initialData?.images?.indexOf(v.imageUrl!)
          : null,
    })) || [
      {
        name: "پیش‌فرض",
        colorCode: "#000000",
        stock: 1,
        priceDiff: 0,
        imageIndex: null,
      },
    ]
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      if (onSuccess) onSuccess();
    } else if (state.message) toast.error(state.message);
  }, [state, onSuccess]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => ({
        url: URL.createObjectURL(file),
        isExisting: false,
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      // بعد از حذف عکس، باید ایندکس واریانت‌هایی که به عکس‌های بعد از این اشاره می‌کردند اصلاح شود
      setVariants(
        variants.map((v) => {
          if (v.imageIndex === index) return { ...v, imageIndex: null };
          if (v.imageIndex !== null && v.imageIndex > index)
            return { ...v, imageIndex: v.imageIndex - 1 };
          return v;
        })
      );
      return newList;
    });
  };

  const updateVariant = (
    index: number,
    field: keyof VariantItem,
    value: any
  ) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = (formData: FormData) => {
    formData.delete("images");
    imageFiles.forEach((file) => formData.append("images", file));
    const remainingExisting = previewImages
      .filter((img) => img.isExisting)
      .map((img) => img.url);
    formData.append("existingImages", JSON.stringify(remainingExisting));
    formData.append("variants", JSON.stringify(variants));
    formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-8 pb-6 text-right" dir="rtl">
      {/* بخش تصاویر (گالری) */}
      <div className="space-y-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <Label className="font-bold flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-purple-500" /> گالری تصاویر محصول
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] text-gray-500 mt-2">افزودن عکس</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {previewImages.map((img, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-xl"
            >
              <Image
                src={img.url}
                alt="product"
                fill
                className="object-cover"
              />
              <div className="absolute top-1 right-1 bg-black/60 text-[10px] text-white w-5 h-5 flex items-center justify-center rounded-full">
                {index + 1}
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Trash2 className="text-white w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* بخش تنوع محصول (واریانت) */}
      <div className="space-y-4 p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" /> مدیریت رنگ‌ها و موجودی
          </h3>
          <button
            type="button"
            onClick={() =>
              setVariants([
                ...variants,
                {
                  name: "",
                  colorCode: "#000000",
                  stock: 0,
                  priceDiff: 0,
                  imageIndex: null,
                },
              ])
            }
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            + افزودن رنگ جدید
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
              <div className="flex-1 min-w-[120px] space-y-2">
                <Label className="text-xs text-gray-400">نام رنگ</Label>
                <Input
                  value={v.name}
                  onChange={(e) => updateVariant(i, "name", e.target.value)}
                  placeholder="مثلا: سرمه‌ای"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">کد رنگ</Label>
                <input
                  type="color"
                  value={v.colorCode}
                  onChange={(e) =>
                    updateVariant(i, "colorCode", e.target.value)
                  }
                  className="block w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                />
              </div>
              <div className="w-24 space-y-2">
                <Label className="text-xs text-gray-400">موجودی</Label>
                <Input
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              {/* انتخاب عکس اختصاصی */}
              <div className="w-32 space-y-2">
                <Label className="text-xs text-gray-400">عکس این رنگ</Label>
                <select
                  value={v.imageIndex ?? ""}
                  onChange={(e) =>
                    updateVariant(
                      i,
                      "imageIndex",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="w-full h-10 px-2 rounded-lg border border-white/10 bg-white/5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">عکس اصلی</option>
                  {previewImages.map((_, idx) => (
                    <option key={idx} value={idx}>
                      عکس شماره {idx + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() =>
                  setVariants(variants.filter((_, idx) => idx !== i))
                }
                className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition mb-[2px]"
                disabled={variants.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* اطلاعات پایه */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="space-y-2">
          <Label>نام محصول</Label>
          <Input
            name="name"
            defaultValue={initialData?.name}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>قیمت پایه (تومان)</Label>
          <Input
            name="price"
            type="number"
            defaultValue={initialData?.price}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>دسته‌بندی</Label>
          <select
            name="categoryId"
            defaultValue={initialData?.categoryId}
            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-white/5 text-sm outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>برند</Label>
          <select
            name="brandId"
            defaultValue={initialData?.brandId || "null"}
            className="w-full h-11 px-3 rounded-xl border border-white/10 bg-white/5 text-sm outline-none"
          >
            <option value="null">بدون برند</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>توضیحات</Label>
        <Textarea
          name="description"
          defaultValue={initialData?.description || ""}
          rows={4}
          className="rounded-2xl border-white/10 bg-white/5"
        />
      </div>

      <div className="flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <Switch
            name="isAvailable"
            defaultChecked={initialData?.isAvailable ?? true}
          />
          <Label className="text-sm font-medium">نمایش محصول در سایت</Label>
        </div>
        <SubmitButton
          className="w-56 h-12 rounded-xl"
          text={isEditMode ? "بروزرسانی محصول" : "ذخیره محصول جدید"}
        />
      </div>
    </form>
  );
}
