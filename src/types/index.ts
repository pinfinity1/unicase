import { Prisma } from "@prisma/client";

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
