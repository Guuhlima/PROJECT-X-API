import { FastifyInstance } from "fastify";
import { CreateUserUseCase } from "@application/use-case/user/CreateUserUseCase";
import { PrismaUserRepository } from "@infrastructure/database/prisma/repositories/PrismaUserRepository";
import { prisma } from "@infrastructure/database/prisma/client";
import { IdGenerator } from "@application/ports/IdGenerator";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

export async function userRoutes(app: FastifyInstance) {
  const userRepo = new PrismaUserRepository(prisma);
  const scryptAsync = promisify(scrypt);

  const passwordHasher: PasswordHasher = {
    async hash(plain: string): Promise<string> {
      const salt = randomBytes(16).toString("hex");
      const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
      return `${salt}.${derived.toString("hex")}`;
    },
    async compare(plain: string, hash: string): Promise<Boolean> {
      const [salt, key] = hash.split(".");
      if (!salt || !key) return false;
      const derived = (await scryptAsync(plain, salt, 64)) as Buffer;
      const keyBuffer = Buffer.from(key, "hex");
      if (keyBuffer.length !== derived.length) return false;
      return timingSafeEqual(keyBuffer, derived);
    },
  };

  const idGenerator: IdGenerator = {
    newId(): string {
      return randomUUID();
    },
  };

  const createUser = new CreateUserUseCase(userRepo, passwordHasher, idGenerator);

  app.post("/users", async (req, reply) => {
    const body = req.body as { name: string; email: string; password: string };

    try {
      const result = await createUser.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /users failed");

      const message = err?.message ?? "UNKNOWN_ERROR";

      if (message === "Email is already in use.") {
        return reply.code(409).send({ error: "EMAIL_IN_USE" });
      }

      return reply.code(400).send({
        error: "BAD_REQUEST",
        message,
      });
    }
  });
}
