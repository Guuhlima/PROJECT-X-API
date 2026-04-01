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
import { PasswordResetSessionManager, PasswordResetSessionPayload } from "@application/ports/PasswordResetSessionManager";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { TokenSigner } from "@application/ports/TokenSigner";

import { N8nNotifier } from "@infrastructure/notifiers/N8nNotifier"; 
import { PrismaPasswordResetTokenRepository } from "@infrastructure/database/prisma/repositories/PrismaPasswordResetTokenRepository";
import { CreatePasswordResetSessionUseCase } from "@application/use-case/user/application/use-case/user/CreatePasswordResetSessionUseCase";
import { RequestPasswordResetUseCase } from "@application/use-case/user/application/use-case/user/RequestPasswordResetUseCase";
import { ResetPasswordUseCase } from "@application/use-case/user/application/use-case/user/ResetPasswordUseCase";
import { ResetPasswordWithSessionUseCase } from "@application/use-case/user/application/use-case/user/ResetPasswordWithSessionUseCase";
import { DomainError } from "@shared/errors/DomainError";

export function buildContainer() {
  const parseNumberEnv = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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
  const passwordResetSessionSecret =
    process.env.PASSWORD_RESET_SESSION_SECRET ?? process.env.AUTH_JWT_SECRET;
  const passwordResetSessionMaxAgeSeconds = parseNumberEnv(
    process.env.PASSWORD_RESET_SESSION_MAX_AGE_SECONDS,
    600
  );

  const tokenSigner: TokenSigner = {
    async sign(payload) {
      const secret = process.env.AUTH_JWT_SECRET;
      if (!secret) throw new Error("Missing auth JWT secret.");

      return jwt.sign(payload, secret, {
        expiresIn: (process.env.AUTH_JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
      });
    },
  };

  const passwordResetSessionManager: PasswordResetSessionManager = {
    cookieName: process.env.PASSWORD_RESET_COOKIE_NAME ?? "reset_password_session",
    maxAgeSeconds: passwordResetSessionMaxAgeSeconds,
    async create(payload: PasswordResetSessionPayload): Promise<string> {
      if (!passwordResetSessionSecret) {
        throw new Error("Missing password reset session secret.");
      }

      return jwt.sign(payload, passwordResetSessionSecret, {
        expiresIn: passwordResetSessionMaxAgeSeconds,
        issuer: "track-products-api",
        audience: "password-reset",
      });
    },
    async verify(token: string): Promise<PasswordResetSessionPayload> {
      if (!passwordResetSessionSecret) {
        throw new Error("Missing password reset session secret.");
      }

      try {
        const decoded = jwt.verify(token, passwordResetSessionSecret, {
          issuer: "track-products-api",
          audience: "password-reset",
        });

        if (typeof decoded === "string") {
          throw new DomainError("Invalid reset session.");
        }

        if (
          decoded.purpose !== "password-reset" ||
          typeof decoded.sub !== "string" ||
          typeof decoded.tokenId !== "string"
        ) {
          throw new DomainError("Invalid reset session.");
        }

        return {
          sub: decoded.sub,
          tokenId: decoded.tokenId,
          purpose: "password-reset",
        };
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          throw new DomainError("Reset session expired.");
        }

        if (err instanceof DomainError) {
          throw err;
        }

        throw new DomainError("Invalid reset session.");
      }
    },
  };

  const userRepo = new PrismaUserRepository(prisma);
  const carrierRepo = new PrismaCarrierRepository();
  const trackingRepo = new PrismaTrackingRepository();
  const passwordResetTokenRepo = new PrismaPasswordResetTokenRepository(prisma);
  const userWebhookUrl = process.env.N8N_USER_WEBHOOK;
  const passwordResetWebhookUrl =
    process.env.N8N_PASSWORD_RESET_WEBHOOK ?? userWebhookUrl;

  const notifier = new N8nNotifier({
    userCreatedWebhookUrl: userWebhookUrl,
    passwordResetWebhookUrl,
    hmacSecret: process.env.N8N_WEBHOOK_SECRET,
    jwtSecret: process.env.N8N_JWT_SECRET,
    timeoutMs: parseNumberEnv(process.env.N8N_WEBHOOK_TIMEOUT_MS, 4000),
    maxAttempts: parseNumberEnv(process.env.N8N_WEBHOOK_MAX_ATTEMPTS, 3),
    retryDelayMs: parseNumberEnv(process.env.N8N_WEBHOOK_RETRY_DELAY_MS, 1000),
  });

  const createUser = new CreateUserUseCase(userRepo, passwordHasher, idGenerator, notifier);
  const confirmUser = new ConfirmUserUseCase(userRepo);
  const login = new LoginUseCase(userRepo, passwordHasher, tokenSigner);
  const createPasswordResetSession = new CreatePasswordResetSessionUseCase(
    userRepo,
    passwordResetTokenRepo,
    passwordResetSessionManager
  );
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
  const resetPasswordWithSession = new ResetPasswordWithSessionUseCase(
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
      createPasswordResetSession,
      requestPasswordReset,
      resetPassword,
      resetPasswordWithSession
    },
    infra: {
      notifier,
      passwordResetSessionManager,
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
