import { Brand, Category, Prisma } from "@prisma/client";

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

export type ProductClient = Omit<
  ProductWithCategory,
  "price" | "discountPrice"
> & {
  price: number;
  discountPrice: number | null;
  category: Category;
  brand: Brand | null; // 👈 اضافه شد (میتونه null باشه)
  createdAt: string;
  updatedAt: string;
};

export type FormState = {
  success?: boolean;
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: true;
  };
}>;
