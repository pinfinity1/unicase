import { Prisma } from "@prisma/client";

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: true;
  };
}>;

export type ProductClient = Omit<
  ProductWithCategory,
  "price" | "discountPrice"
> & {
  price: number;
  discountPrice: number | null;
};
