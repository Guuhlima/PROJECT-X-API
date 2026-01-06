import fastify from "fastify";
import 'dotenv/config'

import { trackingsRoutes } from "@infrastructure/http/fastify/routes/tracking";

async function bootstrap() {
    const app = fastify()

    app.get("/health", async () => ({ ok: true }))

    await app.register(trackingsRoutes)



    const PORT = Number(process.env.PORT)
    app.listen({port: PORT}, () => {
        console.log(`Server Running in ${PORT}`)
    })
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});