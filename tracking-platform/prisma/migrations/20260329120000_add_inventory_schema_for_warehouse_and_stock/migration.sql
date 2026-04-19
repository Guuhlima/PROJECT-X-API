CREATE SCHEMA IF NOT EXISTS "inventory";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'warehouse'
  ) THEN
    ALTER TABLE "public"."warehouse" SET SCHEMA "inventory";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'inventory' AND table_name = 'warehouse'
  ) THEN
    CREATE TABLE "inventory"."warehouse" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'stock'
  ) THEN
    ALTER TABLE "public"."stock" SET SCHEMA "inventory";
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'inventory' AND table_name = 'stock'
  ) THEN
    CREATE TABLE "inventory"."stock" (
      "id" TEXT NOT NULL,
      "warehouseId" TEXT NOT NULL,
      "sku" TEXT NOT NULL,
      "productName" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stock_warehouseId_fkey'
  ) THEN
    ALTER TABLE "inventory"."stock"
      ADD CONSTRAINT "stock_warehouseId_fkey"
      FOREIGN KEY ("warehouseId")
      REFERENCES "inventory"."warehouse"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "warehouse_code_key"
  ON "inventory"."warehouse"("code");

CREATE UNIQUE INDEX IF NOT EXISTS "stock_warehouseId_sku_key"
  ON "inventory"."stock"("warehouseId", "sku");
