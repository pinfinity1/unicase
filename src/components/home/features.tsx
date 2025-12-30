// src/components/home/features.tsx
import { ShieldCheck, Truck, Zap } from "lucide-react";

export function Features() {
  const items = [
    { icon: Zap, title: "ارسال فوری", desc: "زیر ۲۴ ساعت (تهران)" },
    { icon: ShieldCheck, title: "ضمانت اصالت", desc: "۷ روز مهلت تست" },
    { icon: Truck, title: "ارسال رایگان", desc: "خرید بالای ۱ میلیون" },
  ];

  return (
    <section className="w-full border-t border-gray-100 bg-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* 📱 Mobile: flex-col با gap کم + چیدمان سطری (Row) برای هر آیتم
            💻 Desktop: grid-cols-3 + چیدمان وسط‌چین (Center Block)
         */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-gray-100">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-row items-center gap-4 text-right md:flex-col md:justify-center md:text-center md:gap-2 px-2"
            >
              {/* آیکون */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-900 md:h-14 md:w-14 md:mb-2">
                <item.icon
                  className="h-5 w-5 md:h-6 md:w-6"
                  strokeWidth={1.5}
                />
              </div>

              {/* متن‌ها */}
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-gray-900 md:text-base">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-gray-500 md:text-sm">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
