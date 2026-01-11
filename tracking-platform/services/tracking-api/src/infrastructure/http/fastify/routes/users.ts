import { FastifyInstance } from "fastify";

export async function userRoutes(app: FastifyInstance) {
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
