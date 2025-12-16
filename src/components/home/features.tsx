import { ShieldCheck, Truck, Zap } from "lucide-react";

export function Features() {
  const items = [
    { icon: Zap, title: "ارسال فوری", desc: "تحویل زیر ۲۴ ساعت در تهران" },
    {
      icon: ShieldCheck,
      title: "ضمانت اصالت",
      desc: "تضمین بازگشت وجه ۷ روزه",
    },
    { icon: Truck, title: "ارسال رایگان", desc: "برای خریدهای بالای ۱ میلیون" },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 my-24">
      {items.map((item, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-gray-900 group-hover:scale-110 transition-transform">
            <item.icon className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}
