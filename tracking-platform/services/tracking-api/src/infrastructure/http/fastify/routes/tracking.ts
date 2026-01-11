import { FastifyInstance } from "fastify";

export async function trackingsRoutes(app: FastifyInstance) {
  app.post("/trackings", async (req, reply) => {
    const body = req.body as { carrierSlug: string; trackingCode: string };

    try {
      const result = await app.useCases.createTracking.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /trackings failed");

      const message = err?.message ?? "UNKNOWN_ERROR";
      if (message === "CARRIER_NOT_FOUND") {
        return reply.code(404).send({ error: "CARRIER_NOT_FOUND" });
      }

      return reply.code(400).send({ error: "BAD_REQUEST", message });
    }
  });
}
