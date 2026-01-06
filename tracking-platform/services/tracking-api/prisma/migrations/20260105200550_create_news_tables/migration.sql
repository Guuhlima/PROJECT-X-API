-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('CREATED', 'INFO_RECEIVED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELERIVED', 'EXCEPTION', 'RETURNED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActivate" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackings" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "currentStatus" "TrackingStatus" NOT NULL DEFAULT 'CREATED',
    "lastEventAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trackings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "eventAt" TIMESTAMP(3) NOT NULL,
    "status" "TrackingStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "rawPayload" JSONB,
    "eventHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "trackings_carrierId_idx" ON "trackings"("carrierId");

-- CreateIndex
CREATE INDEX "trackings_trackingCode_idx" ON "trackings"("trackingCode");

-- CreateIndex
CREATE INDEX "trackings_lastEventAt_idx" ON "trackings"("lastEventAt");

-- CreateIndex
CREATE UNIQUE INDEX "trackings_carrierId_trackingCode_key" ON "trackings"("carrierId", "trackingCode");

-- CreateIndex
CREATE INDEX "tracking_events_trackingId_eventAt_idx" ON "tracking_events"("trackingId", "eventAt");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_events_trackingId_eventHash_key" ON "tracking_events"("trackingId", "eventHash");

-- AddForeignKey
ALTER TABLE "trackings" ADD CONSTRAINT "trackings_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "trackings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
