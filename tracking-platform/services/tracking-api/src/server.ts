import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import containerPlugin from "@infrastructure/http/plugins/container.plugin";
import { userRoutes } from "@infrastructure/http/fastify/routes/users";
import { trackingsRoutes } from "@infrastructure/http/fastify/routes/tracking";

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN?.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(containerPlugin);
  await app.register(userRoutes, { prefix: "/api" });
  await app.register(trackingsRoutes, { prefix: "/api" });

  const port = Number(process.env.PORT);
  const host = process.env.HOST;
  await app.listen({ port, host });
}

bootstrap();
