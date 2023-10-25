-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pwd" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hightGrowthToken" (
    "symbol" TEXT NOT NULL,
    "markPrice" TEXT NOT NULL,
    "lastFundingRate" TEXT NOT NULL,
    "contractPositionGrowth" TEXT NOT NULL,
    "sumOpenInterest" TEXT NOT NULL,
    "sumOpenInterestValue" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "hightGrowthToken_symbol_key" ON "hightGrowthToken"("symbol");
