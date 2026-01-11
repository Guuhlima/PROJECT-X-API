import { FastifyInstance } from "fastify";
import { CreateTrackingUseCase } from "@application/use-case/tracking/CreateTrackingUseCase"; 
import { PrismaCarrierRepository } from "../../../database/prisma/repositories/PrismaCarrierRepository";
import { PrismaTrackingRepository } from "../../../database/prisma/repositories/PrismaTrackingRepository";

export async function trackingsRoutes(app: FastifyInstance) {
  const carrierRepo = new PrismaCarrierRepository();
  const trackingRepo = new PrismaTrackingRepository();
  const createTracking = new CreateTrackingUseCase(carrierRepo, trackingRepo);

  app.post("/trackings", async (req, reply) => {
    const body = req.body as { carrierSlug: string; trackingCode: string };

    try {
      const result = await createTracking.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /trackings failed");

      const message = err?.message ?? "UNKNOWN_ERROR";

      if (message === "CARRIER_NOT_FOUND") {
        return reply.code(404).send({ error: "CARRIER_NOT_FOUND" });
      }

      return reply.code(400).send({
        error: "BAD_REQUEST",
        message,
      });
    }
  });
}
