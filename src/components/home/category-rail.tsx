import Link from "next/link";
import {
  Smartphone,
  Headphones,
  Watch,
  Laptop,
  Battery,
  Wifi,
} from "lucide-react";

const categories = [
  {
    name: "آیفون",
    icon: Smartphone,
    href: "/category/iphone",
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "ایرپاد",
    icon: Headphones,
    href: "/category/audio",
    color: "bg-green-100 text-green-600",
  },
  {
    name: "اپل واچ",
    icon: Watch,
    href: "/category/watch",
    color: "bg-red-100 text-red-600",
  },
  {
    name: "شارژر",
    icon: Battery,
    href: "/category/charger",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export function CategoryRail() {
  return (
    <section className="py-10">
      <div className="flex items-center gap-6 overflow-x-auto p-4 scrollbar-hide sm:justify-center">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            className="group flex flex-col items-center gap-3 min-w-[80px]"
          >
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-[24px] ${cat.color} bg-opacity-50 backdrop-blur-md shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md border border-white/50`}
            >
              <cat.icon className="h-8 w-8" />
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-black transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
