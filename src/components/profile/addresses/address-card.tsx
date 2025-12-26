// src/components/profile/address-card.tsx
import { MapPin, Trash2, Home, Briefcase, User, Phone } from "lucide-react";
import { deleteAddress } from "@/actions/address";
import { Button } from "@/components/ui/button";

interface AddressCardProps {
  addr: {
    id: string;
    title: string;
    province: string;
    city: string;
    fullAddress: string;
    postalCode: string;
    recipientName: string;
    recipientPhone: string;
    isDefault: boolean;
  };
}

export function AddressCard({ addr }: AddressCardProps) {
  return (
    <div className="group relative p-6 bg-white/40 border border-white/60 rounded-[32px] backdrop-blur-md shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-500 overflow-hidden">
      <MapPin className="absolute -bottom-4 -left-4 h-24 w-24 text-black/5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
              {addr.title.includes("کار") ? (
                <Briefcase size={20} />
              ) : (
                <Home size={20} />
              )}
            </div>
            <div>
              <h3 className="font-black text-gray-900">{addr.title}</h3>
              {addr.isDefault && (
                <span className="text-[10px] bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full font-black border border-green-500/20">
                  انتخاب اول
                </span>
              )}
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await deleteAddress(addr.id);
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-red-500 transition-colors duration-300 cursor-pointer"
            >
              <Trash2 size={16} />
            </Button>
          </form>
        </div>

        <p className="text-sm text-gray-700 leading-7 font-medium mb-4 min-h-[50px]">
          {addr.province}، {addr.city}، {addr.fullAddress}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold">
            <User size={14} className="opacity-40" />
            <span className="truncate">{addr.recipientName}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono font-bold justify-end">
            <span>{addr.recipientPhone}</span>
            <Phone size={14} className="opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
