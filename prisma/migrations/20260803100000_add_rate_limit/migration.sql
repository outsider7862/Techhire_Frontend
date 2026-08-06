-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_teamId_kind_windowStart_key" ON "RateLimit"("teamId", "kind", "windowStart");
