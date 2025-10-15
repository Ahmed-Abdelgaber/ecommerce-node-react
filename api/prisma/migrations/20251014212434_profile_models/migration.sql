-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "displayName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "activeCartId" UUID,
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creation_user_id" UUID,
    "last_update" TIMESTAMPTZ(6) NOT NULL,
    "update_user_id" UUID,
    "delete_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "label" TEXT,
    "recipientName" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "countryCode" VARCHAR(2) NOT NULL,
    "is_default_shipping" BOOLEAN NOT NULL DEFAULT false,
    "is_default_billing" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "creation_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creation_user_id" UUID,
    "last_update" TIMESTAMPTZ(6) NOT NULL,
    "update_user_id" UUID,
    "delete_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE INDEX "idx_profile_user" ON "profile"("userId");

-- CreateIndex
CREATE INDEX "idx_profile_active_cart" ON "profile"("activeCartId");

-- CreateIndex
CREATE INDEX "idx_address_profile" ON "address"("profileId");

-- CreateIndex
CREATE INDEX "idx_address_country" ON "address"("countryCode");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_activeCartId_fkey" FOREIGN KEY ("activeCartId") REFERENCES "cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
