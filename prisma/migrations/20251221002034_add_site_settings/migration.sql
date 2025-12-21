-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "storeName" TEXT NOT NULL DEFAULT 'UniCase',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "description" TEXT,
    "instagramUrl" TEXT,
    "telegramUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
