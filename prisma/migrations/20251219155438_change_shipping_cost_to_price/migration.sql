/*
  Warnings:

  - You are about to drop the column `cost` on the `ShippingMethod` table. All the data in the column will be lost.
  - Added the required column `price` to the `ShippingMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "province" TEXT;

-- AlterTable
ALTER TABLE "ShippingMethod" DROP COLUMN "cost",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;
