-- CreateTable
CREATE TABLE "cart" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creation_user_id" UUID,
    "last_update" TIMESTAMPTZ(6) NOT NULL,
    "update_user_id" UUID,
    "delete_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creation_user_id" UUID,
    "last_update" TIMESTAMPTZ(6) NOT NULL,
    "update_user_id" UUID,
    "delete_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cart_user" ON "cart"("userId");

-- CreateIndex
CREATE INDEX "idx_cart_item_cart" ON "cart_item"("cartId");

-- CreateIndex
CREATE INDEX "idx_cart_item_product" ON "cart_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "uq_cart_item_unique_line" ON "cart_item"("cartId", "productId", "variantId");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
