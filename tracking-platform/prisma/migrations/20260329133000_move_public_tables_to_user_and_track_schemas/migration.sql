CREATE SCHEMA IF NOT EXISTS "user";
CREATE SCHEMA IF NOT EXISTS "track";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Users'
  ) THEN
    ALTER TABLE "public"."Users" SET SCHEMA "user";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'user' AND table_name = 'Users'
  ) THEN
    CREATE TABLE "user"."Users" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "verified" BOOLEAN NOT NULL DEFAULT false,

      CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

ALTER TABLE "user"."Users"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "Users_email_key"
  ON "user"."Users"("email");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'TrackingStatus'
  ) THEN
    ALTER TYPE "public"."TrackingStatus" SET SCHEMA "track";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'track'
      AND t.typname = 'TrackingStatus'
  ) THEN
    CREATE TYPE "track"."TrackingStatus" AS ENUM (
      'CREATED',
      'INFO_RECEIVED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'EXCEPTION',
      'RETURNED',
      'UNKNOWN'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'carriers'
  ) THEN
    ALTER TABLE "public"."carriers" SET SCHEMA "track";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'track' AND table_name = 'carriers'
  ) THEN
    CREATE TABLE "track"."carriers" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trackings'
  ) THEN
    ALTER TABLE "public"."trackings" SET SCHEMA "track";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'track' AND table_name = 'trackings'
  ) THEN
    CREATE TABLE "track"."trackings" (
      "id" TEXT NOT NULL,
      "carrierId" TEXT NOT NULL,
      "trackingCode" TEXT NOT NULL,
      "currentStatus" "track"."TrackingStatus" NOT NULL DEFAULT 'CREATED',
      "lastEventAt" TIMESTAMP(3),
      "isActive" BOOLEAN NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "trackings_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tracking_events'
  ) THEN
    ALTER TABLE "public"."tracking_events" SET SCHEMA "track";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'track' AND table_name = 'tracking_events'
  ) THEN
    CREATE TABLE "track"."tracking_events" (
      "id" TEXT NOT NULL,
      "trackingId" TEXT NOT NULL,
      "eventAt" TIMESTAMP(3) NOT NULL,
      "status" "track"."TrackingStatus" NOT NULL,
      "description" TEXT NOT NULL,
      "location" TEXT,
      "rawPayload" JSONB,
      "eventHash" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'password_reset_tokens'
  ) THEN
    ALTER TABLE "public"."password_reset_tokens" SET SCHEMA "user";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'user' AND table_name = 'password_reset_tokens'
  ) THEN
    CREATE TABLE "user"."password_reset_tokens" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tokenHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "usedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_tokenHash_key"
  ON "user"."password_reset_tokens"("tokenHash");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx"
  ON "user"."password_reset_tokens"("userId");

CREATE INDEX IF NOT EXISTS "password_reset_tokens_expiresAt_idx"
  ON "user"."password_reset_tokens"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'password_reset_tokens_userId_fkey'
  ) THEN
    ALTER TABLE "user"."password_reset_tokens"
      ADD CONSTRAINT "password_reset_tokens_userId_fkey"
      FOREIGN KEY ("userId")
      REFERENCES "user"."Users"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;
