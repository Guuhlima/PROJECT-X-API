import { FastifyInstance } from "fastify";
import { sendAppError } from "@shared/errors/handleAppError";

export async function trackingsRoutes(app: FastifyInstance) {
  app.post("/trackings", async (req, reply) => {
    const body = req.body as { carrierSlug: string; trackingCode: string };

    try {
      const result = await app.useCases.createTracking.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /trackings failed");
      return sendAppError(reply, err);
    }
  });
}
