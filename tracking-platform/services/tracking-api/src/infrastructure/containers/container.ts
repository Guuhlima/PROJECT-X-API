import { randomUUID, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@infrastructure/database/prisma/client";
import { PrismaUserRepository } from "@infrastructure/database/prisma/repositories/PrismaUserRepository";
import { PrismaCarrierRepository } from "@infrastructure/database/prisma/repositories/PrismaCarrierRepository";
import { PrismaTrackingRepository } from "@infrastructure/database/prisma/repositories/PrismaTrackingRepository";
import { CreateUserUseCase } from "@application/use-case/user/application/use-case/user/CreateUserUseCase"; 
import { ConfirmUserUseCase } from "@application/use-case/user/application/use-case/user/ConfirmUserUseCase"; 
import { CreateTrackingUseCase } from "@application/use-case/tracking/CreateTrackingUseCase";
import { IdGenerator } from "@application/ports/IdGenerator";
import { PasswordHasher } from "@application/ports/PasswordHasher";

import { N8nNotifier } from "@infrastructure/notifiers/N8nNotifier"; 
import { PrismaPasswordResetTokenRepository } from "@infrastructure/database/prisma/repositories/PrismaPasswordResetTokenRepository";
import { RequestPasswordResetUseCase } from "@application/use-case/user/application/use-case/user/RequestPasswordResetUseCase";
import { ResetPasswordUseCase } from "@application/use-case/user/application/use-case/user/ResetPasswordUseCase";

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
  const passwordResetTokenRepo = new PrismaPasswordResetTokenRepository(prisma);

  const notifier = new N8nNotifier({
    userCreatedWebhookUrl: process.env.N8N_USER_CREATED_WEBHOOK,
    passwordResetWebhookUrl: process.env.N8N_PASSWORD_RESET_WEBHOOK,
    hmacSecret: process.env.N8N_WEBHOOK_SECRET,
    jwtSecret: process.env.N8N_JWT_SECRET,
  });

  const createUser = new CreateUserUseCase(userRepo, passwordHasher, idGenerator, notifier);
  const confirmUser = new ConfirmUserUseCase(userRepo);
  const requestPasswordReset = new RequestPasswordResetUseCase(
    userRepo,
    passwordResetTokenRepo,
    idGenerator,
    notifier,
    process.env.PASSWORD_RESET_URL_BASE!
  );
  const resetPassword = new ResetPasswordUseCase(
    userRepo,
    passwordResetTokenRepo,
    passwordHasher
  );
  const createTracking = new CreateTrackingUseCase(carrierRepo, trackingRepo);

  return {
    useCases: {
      createUser,
      confirmUser,
      createTracking,
      requestPasswordReset,
      resetPassword
    },
    infra: {
      notifier,
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
