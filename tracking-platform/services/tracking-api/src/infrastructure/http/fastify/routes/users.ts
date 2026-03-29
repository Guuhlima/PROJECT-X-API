import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
  app.post("/login", async (req, reply) => {
    const body = req.body as { email: string; password: string };

    try {
      const result = await app.useCases.login.execute(body);
      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /login failed");

      const message = err?.message ?? "UNKNOWN_ERROR";

      if (message === "Invalid credentials.") {
        return reply.code(401).send({ error: "INVALID_CREDENTIALS" });
      }

      if (message === "User is inactive.") {
        return reply.code(403).send({ error: "USER_INACTIVE" });
      }

      if (message === "User is not verified.") {
        return reply.code(403).send({ error: "USER_NOT_VERIFIED" });
      }

      return reply.code(400).send({ error: "BAD_REQUEST", message });
    }
  });

  app.post("/users", async (req, reply) => {
    const body = req.body as { name: string; email: string; password: string };

    try {
      const result = await app.useCases.createUser.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /users failed");

      const message = err?.message ?? "UNKNOWN_ERROR";
      if (message === "Email is already in use.") {
        return reply.code(409).send({ error: "EMAIL_IN_USE" });
      }

      return reply.code(400).send({ error: "BAD_REQUEST", message });
    }
  });

    app.post("/forgot-password", async (req, reply) => {
    const body = req.body as { email: string };

    try {
      const result = await app.useCases.requestPasswordReset.execute(body);
      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /forgot-password failed");
      return reply.code(400).send({
        error: "BAD_REQUEST",
        message: err?.message ?? "Unknown Error",
      });
    }
  });

  app.post("/reset-password", async (req, reply) => {
    const body = req.body as { token: string; password: string };

    try {
      const result = await app.useCases.resetPassword.execute(body);
      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /reset-password failed");
      return reply.code(400).send({
        error: "BAD_REQUEST",
        message: err?.message ?? "Unknown Error",
      });
    }
  });

  app.get("/user-validation", async (req, reply) => {
    const { userId } = req.query as { userId?: string };

    if (!userId) {
      return reply.code(400).send({ error: "MISSING_USER_ID "});
    }

    try {
      await app.useCases.confirmUser.execute(userId);

      return reply.code(200).send({ ok: true, message: "User Confirmed." });
    } catch (err: any) {
      req.log.error({ err }, "GET /user-validation failed" );
      return reply.send(400).send({ error: "Bad request", message: err?.message ?? "Unknown Error" }); 
    }
  })
}
