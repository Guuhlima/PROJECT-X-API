import fp from "fastify-plugin";
import { buildContainer, AppContainer } from "@infrastructure/containers/container";

declare module "fastify" {
  interface FastifyInstance {
    container: AppContainer;
    useCases: AppContainer["useCases"];
  }
}

export default fp(async (app) => {
  const container = buildContainer();
  app.decorate("container", container);
  app.decorate("useCases", container.useCases);
});
