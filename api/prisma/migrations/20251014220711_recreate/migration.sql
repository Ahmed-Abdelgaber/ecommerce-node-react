/*
  Warnings:

  - You are about to drop the column `variantId` on the `cart_item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,productId]` on the table `cart_item` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."uq_cart_item_unique_line";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "options" JSONB;

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "variantId",
ADD COLUMN     "options" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "uq_cart_item_unique_line" ON "cart_item"("cartId", "productId");
