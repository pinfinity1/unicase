// src/components/profile/empty-address-state.tsx
import { MapPin } from "lucide-react";
import { AddAddressModal } from "../add-address-modal";

export function EmptyAddressState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/20 backdrop-blur-md rounded-[40px] border border-white/50 border-dashed">
      <div className="h-20 w-20 bg-white/60 border-2 border-gray-100 rounded-full flex items-center justify-center shadow-inner mb-6">
        <MapPin className="h-10 w-10 text-gray-400" />
      </div>
      <p className="text-gray-600 font-bold mb-6">
        هنوز هیچ آدرسی ثبت نکرده‌اید
      </p>
    </div>
  );
}
