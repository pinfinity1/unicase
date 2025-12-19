"use client";

import { cn } from "@/lib/utils";
import { Truck, Clock } from "lucide-react";

// 👇 کلمه export اضافه شد
export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: string | null;
  onSelect: (id: string) => void;
}

export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
        <Truck className="h-5 w-5" />
        شیوه ارسال
      </h2>

      <div className="grid gap-3">
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id;
          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={cn(
                "relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200",
                isSelected
                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                  : "border-gray-100 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? "border-gray-900 bg-gray-900"
                      : "border-gray-300 bg-transparent"
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {method.name}
                  </p>
                  {method.description && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{method.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm font-bold text-gray-900">
                {method.price === 0
                  ? "رایگان"
                  : `${new Intl.NumberFormat("fa-IR").format(
                      method.price
                    )} تومان`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
