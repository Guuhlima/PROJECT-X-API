/*
  Warnings:

  - The values [DELERIVED] on the enum `TrackingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActivate` on the `carriers` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `trackings` table. All the data in the column will be lost.
  - Added the required column `isActive` to the `carriers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `trackings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TrackingStatus_new" AS ENUM ('CREATED', 'INFO_RECEIVED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURNED', 'UNKNOWN');
ALTER TABLE "trackings" ALTER COLUMN "currentStatus" DROP DEFAULT;
ALTER TABLE "trackings" ALTER COLUMN "currentStatus" TYPE "TrackingStatus_new" USING ("currentStatus"::text::"TrackingStatus_new");
ALTER TABLE "tracking_events" ALTER COLUMN "status" TYPE "TrackingStatus_new" USING ("status"::text::"TrackingStatus_new");
ALTER TYPE "TrackingStatus" RENAME TO "TrackingStatus_old";
ALTER TYPE "TrackingStatus_new" RENAME TO "TrackingStatus";
DROP TYPE "TrackingStatus_old";
ALTER TABLE "trackings" ALTER COLUMN "currentStatus" SET DEFAULT 'CREATED';
COMMIT;

-- AlterTable
ALTER TABLE "carriers" DROP COLUMN "isActivate",
ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "trackings" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
