import { randomUUID, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "@infrastructure/database/prisma/client";
import { PrismaUserRepository } from "@infrastructure/database/prisma/repositories/PrismaUserRepository";
import { PrismaCarrierRepository } from "@infrastructure/database/prisma/repositories/PrismaCarrierRepository";
import { PrismaTrackingRepository } from "@infrastructure/database/prisma/repositories/PrismaTrackingRepository";
import { CreateUserUseCase } from "@application/use-case/user/application/use-case/user/CreateUserUseCase"; 
import { ConfirmUserUseCase } from "@application/use-case/user/application/use-case/user/ConfirmUserUseCase"; 
import { LoginUseCase } from "@application/use-case/user/application/use-case/user/LoginUseCase";
import { CreateTrackingUseCase } from "@application/use-case/tracking/CreateTrackingUseCase";
import { IdGenerator } from "@application/ports/IdGenerator";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { TokenSigner } from "@application/ports/TokenSigner";

import { N8nNotifier } from "@infrastructure/notifiers/N8nNotifier"; 
import { PrismaPasswordResetTokenRepository } from "@infrastructure/database/prisma/repositories/PrismaPasswordResetTokenRepository";
import { RequestPasswordResetUseCase } from "@application/use-case/user/application/use-case/user/RequestPasswordResetUseCase";
import { ResetPasswordUseCase } from "@application/use-case/user/application/use-case/user/ResetPasswordUseCase";

export function buildContainer() {
  const parseNumberEnv = (value: string | undefined): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 1000;
  };

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

  const tokenSigner: TokenSigner = {
    async sign(payload) {
      const secret = process.env.AUTH_JWT_SECRET;
      if (!secret) throw new Error("Missing auth JWT secret.");

      return jwt.sign(payload, secret, {
        expiresIn: (process.env.AUTH_JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
      });
    },
  };

  const userRepo = new PrismaUserRepository(prisma);
  const carrierRepo = new PrismaCarrierRepository();
  const trackingRepo = new PrismaTrackingRepository();
  const passwordResetTokenRepo = new PrismaPasswordResetTokenRepository(prisma);
  const userWebhookUrl = process.env.N8N_USER_WEBHOOK;

  const notifier = new N8nNotifier({
    userCreatedWebhookUrl: userWebhookUrl,
    hmacSecret: process.env.N8N_WEBHOOK_SECRET,
    jwtSecret: process.env.N8N_JWT_SECRET,
    timeoutMs: parseNumberEnv(process.env.N8N_WEBHOOK_TIMEOUT_MS),
    maxAttempts: parseNumberEnv(process.env.N8N_WEBHOOK_MAX_ATTEMPTS),
    retryDelayMs: parseNumberEnv(process.env.N8N_WEBHOOK_RETRY_DELAY_MS),
  });

  const createUser = new CreateUserUseCase(userRepo, passwordHasher, idGenerator, notifier);
  const confirmUser = new ConfirmUserUseCase(userRepo);
  const login = new LoginUseCase(userRepo, passwordHasher, tokenSigner);
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
      login,
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
