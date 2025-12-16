import { ProductClient } from "@/types";

interface ProductJsonLdProps {
  product: ProductClient;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  // ساختار استاندارد Schema.org برای محصول
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      priceCurrency: "IRT", // یا IRT اگر تومان است (گوگل با IRR بهتر کار می‌کند معمولا)
      price: product.price, // قیمت به عدد
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "UniCase",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
