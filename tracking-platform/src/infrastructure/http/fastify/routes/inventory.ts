import { FastifyInstance } from "fastify";
import { sendAppError } from "@shared/errors/handleAppError";

export async function inventoryRoutes(app: FastifyInstance) {
  app.post("/warehouses", async (req, reply) => {
    const body = req.body as { name: string; code: string; address: string };

    try {
      const result = await app.useCases.createWarehouse.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /warehouses failed");
      return sendAppError(reply, err);
    }
  });

  app.post("/stocks", async (req, reply) => {
    const body = req.body as {
      warehouseId: string;
      sku: string;
      productName: string;
      quantity: number;
    };

    try {
      const result = await app.useCases.createStock.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /stocks failed");
      return sendAppError(reply, err);
    }
  });
}
