import { FastifyInstance } from "fastify";
import {
  clearCookie,
  parseCookies,
  serializeCookie,
} from "@infrastructure/http/cookies/passwordResetSessionCookie";
import { sendAppError } from "@shared/errors/handleAppError";
import { shouldClearResetSessionCookie } from "@shared/errors/user/UserErrors";

export async function userRoutes(app: FastifyInstance) {
  const isSecureResetCookie =
    process.env.PASSWORD_RESET_COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";
  const resetCookiePath = process.env.PASSWORD_RESET_COOKIE_PATH ?? "/api";

  app.post("/login", async (req, reply) => {
    const body = req.body as { email: string; password: string };

    try {
      const result = await app.useCases.login.execute(body);
      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /login failed");
      return sendAppError(reply, err);
    }
  });

  app.post("/users", async (req, reply) => {
    const body = req.body as { name: string; email: string; password: string };

    try {
      const result = await app.useCases.createUser.execute(body);
      return reply.code(201).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /users failed");
      return sendAppError(reply, err);
    }
  });

  app.post("/forgot-password", async (req, reply) => {
    const body = req.body as { email: string };

    try {
      const result = await app.useCases.requestPasswordReset.execute(body);
      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /forgot-password failed");
      return sendAppError(reply, err);
    }
  });

  app.post("/reset-password/session", async (req, reply) => {
    const body = req.body as { token: string };

    try {
      const result = await app.useCases.createPasswordResetSession.execute(body);

      reply.header(
        "Set-Cookie",
        serializeCookie({
          name: app.container.infra.passwordResetSessionManager.cookieName,
          value: result.sessionToken,
          maxAgeSeconds: app.container.infra.passwordResetSessionManager.maxAgeSeconds,
          secure: isSecureResetCookie,
          path: resetCookiePath,
        })
      );

      return reply.code(200).send({ message: result.message });
    } catch (err: any) {
      req.log.error({ err }, "POST /reset-password/session failed");

      reply.header(
        "Set-Cookie",
        clearCookie(
          app.container.infra.passwordResetSessionManager.cookieName,
          isSecureResetCookie,
          resetCookiePath
        )
      );

      return sendAppError(reply, err);
    }
  });

  app.post("/reset-password", async (req, reply) => {
    const body = req.body as { token?: string; password: string };

    try {
      if (body.token) {
        const result = await app.useCases.resetPassword.execute({
          token: body.token,
          password: body.password,
        });

        return reply.code(200).send(result);
      }

      const cookies = parseCookies(req.headers.cookie);
      const resetSessionToken =
        cookies[app.container.infra.passwordResetSessionManager.cookieName];

      if (!resetSessionToken) {
        return reply.code(401).send({ error: "RESET_SESSION_REQUIRED" });
      }

      const session = await app.container.infra.passwordResetSessionManager.verify(
        resetSessionToken
      );

      const result = await app.useCases.resetPasswordWithSession.execute({
        userId: session.sub,
        password: body.password,
      });

      reply.header(
        "Set-Cookie",
        clearCookie(
          app.container.infra.passwordResetSessionManager.cookieName,
          isSecureResetCookie,
          resetCookiePath
        )
      );

      return reply.code(200).send(result);
    } catch (err: any) {
      req.log.error({ err }, "POST /reset-password failed");

      if (shouldClearResetSessionCookie(err)) {
        reply.header(
          "Set-Cookie",
          clearCookie(
            app.container.infra.passwordResetSessionManager.cookieName,
            isSecureResetCookie,
            resetCookiePath
          )
        );
      }

      return sendAppError(reply, err);
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
      return sendAppError(reply, err);
    }
  })
}
