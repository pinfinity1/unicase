import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Send, // آیکون تلگرام (یا شبیه به آن)
  Phone,
  MapPin,
  Mail,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white pt-12 pb-8 font-sans">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* بخش ۱: درباره ما (همیشه ثابت) */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden">
                <Image
                  src="/logo/unicase-black.png"
                  alt="UniCase Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-gray-900">UniCase</span>
            </Link>
            <p className="text-sm text-gray-500 leading-7 text-justify">
              یونی‌کیس، مرجع تخصصی نقد و بررسی و فروش لوازم جانبی دیجیتال است.
              ما با تضمین اصالت کالا و ارسال سریع، تجربه‌ای متفاوت از خرید
              آنلاین را برای شما رقم می‌زنیم.
            </p>

            {/* شبکه‌های اجتماعی (اصلاح شده) */}
            <div className="flex gap-4 pt-2">
              <Link
                href="https://instagram.com/unicase"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition-all"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://t.me/unicase_support"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-all"
              >
                <Send className="h-5 w-5 ml-0.5" />{" "}
                {/* آیکون Send شبیه تلگرام است */}
              </Link>
              <Link
                href="https://wa.me/989120000000"
                target="_blank"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all"
              >
                <Phone className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* بخش ۲: لینک‌ها 
            در دسکتاپ: گرید ۳ ستونه
            در موبایل: مخفی (جایگزین با آکاردئون)
          */}
          <div className="hidden lg:grid lg:col-span-3 grid-cols-3 gap-8">
            <DesktopLinks />
          </div>

          {/* بخش ۳: آکاردئون موبایل 
            در دسکتاپ: مخفی
            در موبایل: نمایش داده می‌شود
          */}
          <div className="lg:hidden w-full">
            <MobileAccordion />
          </div>
        </div>

        {/* کپی‌رایت و نمادها */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center md:text-right">
            تمامی حقوق مادی و معنوی این وب‌سایت متعلق به یونی‌کیس است. © ۲۰۲۵
          </p>
          <div className="flex gap-2">
            <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[8px] text-gray-300">
              Enamad
            </div>
            <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[8px] text-gray-300">
              Samandehi
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ------------------------------------------------------------------
// کامپوننت‌های کمکی برای تمیز ماندن کد اصلی
// ------------------------------------------------------------------

function DesktopLinks() {
  return (
    <>
      {/* ستون دسترسی سریع */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">دسترسی سریع</h3>
        <ul className="space-y-3 text-sm text-gray-500">
          <li>
            <Link
              href="/products"
              className="hover:text-blue-600 transition-colors"
            >
              همه محصولات
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:text-blue-600 transition-colors"
            >
              درباره ما
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:text-blue-600 transition-colors"
            >
              تماس با ما
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="hover:text-blue-600 transition-colors"
            >
              وبلاگ
            </Link>
          </li>
        </ul>
      </div>

      {/* ستون خدمات */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">خدمات مشتریان</h3>
        <ul className="space-y-3 text-sm text-gray-500">
          <li>
            <Link
              href="/profile/orders"
              className="hover:text-blue-600 transition-colors"
            >
              پیگیری سفارش
            </Link>
          </li>
          <li>
            <Link href="/faq" className="hover:text-blue-600 transition-colors">
              پرسش‌های متداول
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="hover:text-blue-600 transition-colors"
            >
              قوانین و مقررات
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              حریم خصوصی
            </Link>
          </li>
        </ul>
      </div>

      {/* ستون تماس */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-4">تماس با ما</h3>
        <ul className="space-y-4 text-sm text-gray-500">
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <span dir="ltr" className="hover:text-gray-900 transition-colors">
              ۰۲۱ - ۸۸ ۸۸ ۸۸ ۸۸
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="hover:text-gray-900 transition-colors">
              info@unicase.ir
            </span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
            <span>تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۱۰</span>
          </li>
        </ul>
      </div>
    </>
  );
}

function MobileAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-b-gray-100">
        <AccordionTrigger className="text-sm font-bold text-gray-900 hover:no-underline hover:text-blue-600">
          دسترسی سریع
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-3 text-sm text-gray-500 pr-2 border-r-2 border-gray-100 mr-1">
            <li>
              <Link href="/products" className="block py-1">
                همه محصولات
              </Link>
            </li>
            <li>
              <Link href="/about" className="block py-1">
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block py-1">
                تماس با ما
              </Link>
            </li>
            <li>
              <Link href="/blog" className="block py-1">
                وبلاگ
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2" className="border-b-gray-100">
        <AccordionTrigger className="text-sm font-bold text-gray-900 hover:no-underline hover:text-blue-600">
          خدمات مشتریان
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-3 text-sm text-gray-500 pr-2 border-r-2 border-gray-100 mr-1">
            <li>
              <Link href="/profile/orders" className="block py-1">
                پیگیری سفارش
              </Link>
            </li>
            <li>
              <Link href="/faq" className="block py-1">
                پرسش‌های متداول
              </Link>
            </li>
            <li>
              <Link href="/terms" className="block py-1">
                قوانین و مقررات
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="block py-1">
                حریم خصوصی
              </Link>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3" className="border-b-0">
        <AccordionTrigger className="text-sm font-bold text-gray-900 hover:no-underline hover:text-blue-600">
          اطلاعات تماس
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-4 text-sm text-gray-500 pr-2 border-r-2 border-gray-100 mr-1">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span dir="ltr">۰۲۱ - ۸۸ ۸۸ ۸۸ ۸۸</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span>info@unicase.ir</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
              <span>تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۱۰</span>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
