import { randomUUID, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@infrastructure/database/prisma/client";
import { PrismaUserRepository } from "@infrastructure/database/prisma/repositories/PrismaUserRepository";
import { PrismaCarrierRepository } from "@infrastructure/database/prisma/repositories/PrismaCarrierRepository";
import { PrismaTrackingRepository } from "@infrastructure/database/prisma/repositories/PrismaTrackingRepository";
import { CreateUserUseCase } from "@application/use-case/user/CreateUserUseCase";
import { ConfirmUserUseCase } from "@application/use-case/user/ConfirmUserUseCase";
import { CreateTrackingUseCase } from "@application/use-case/tracking/CreateTrackingUseCase";
import { IdGenerator } from "@application/ports/IdGenerator";
import { PasswordHasher } from "@application/ports/PasswordHasher";

import { N8nNotifier } from "@infrastructure/notifiers/N8nNotifier"; 

export function buildContainer() {
  const scryptAsync = promisify(scrypt);

  const passwordHasher: PasswordHasher = {
    async hash(plain: string): Promise<string> {
      const salt = randomBytes(16).toString("hex");
      const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
      return `${salt}.${derived.toString("hex")}`;
    },
    async compare(plain: string, hash: string): Promise<boolean> {
      const [salt, key] = hash.split(".");
      if (!salt || !key) return false;
      const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
      const keyBuffer = Buffer.from(key, "hex");
      if (keyBuffer.length !== derived.length) return false;
      return timingSafeEqual(keyBuffer, derived);
    },
  };

  const idGenerator: IdGenerator = { newId: () => randomUUID() };

  const userRepo = new PrismaUserRepository(prisma);
  const carrierRepo = new PrismaCarrierRepository();
  const trackingRepo = new PrismaTrackingRepository();

  const webhookUrl = process.env.N8N_USER_CREATED_WEBHOOK!;
  const hmacSecret = process.env.N8N_WEBHOOK_SECRET;
  const jwtSecret  = process.env.N8N_JWT_SECRET!;

  const notifier = new N8nNotifier(webhookUrl, hmacSecret, jwtSecret);

  console.log('[buildContainer] webhookUrl:', process.env.N8N_USER_CREATED_WEBHOOK);
  console.log('[buildContainer] has jwt secret:', !!process.env.N8N_JWT_SECRET);
  console.log('[buildContainer] notifier:', notifier?.constructor?.name);

  const createUser = new CreateUserUseCase(userRepo, passwordHasher, idGenerator, notifier);
  const confirmUser = new ConfirmUserUseCase(userRepo);
  const createTracking = new CreateTrackingUseCase(carrierRepo, trackingRepo);

  return {
    useCases: {
      createUser,
      confirmUser,
      createTracking,
    },
    infra: {
      notifier,
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
