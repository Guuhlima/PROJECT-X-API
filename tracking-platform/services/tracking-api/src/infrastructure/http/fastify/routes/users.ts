import { FastifyInstance } from "fastify";
import {
  clearCookie,
  parseCookies,
  serializeCookie,
} from "@infrastructure/http/cookies/passwordResetSessionCookie";

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

      if (message === "Missing auth JWT secret.") {
        return reply.code(500).send({
          error: "AUTH_CONFIG_ERROR",
          message: "Authentication is not configured on the server.",
        });
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
      const message = err?.message ?? "Unknown Error";
      req.log.error({ err }, "POST /reset-password/session failed");

      reply.header(
        "Set-Cookie",
        clearCookie(
          app.container.infra.passwordResetSessionManager.cookieName,
          isSecureResetCookie,
          resetCookiePath
        )
      );

      if (message === "Invalid token.") {
        return reply.code(400).send({ error: "INVALID_TOKEN" });
      }

      if (message === "Token already used.") {
        return reply.code(400).send({ error: "TOKEN_ALREADY_USED" });
      }

      if (message === "Token expired.") {
        return reply.code(400).send({ error: "TOKEN_EXPIRED" });
      }

      return reply.code(400).send({
        error: "BAD_REQUEST",
        message,
      });
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
      const message = err?.message ?? "Unknown Error";
      req.log.error({ err }, "POST /reset-password failed");

      if (
        message === "Invalid reset session." ||
        message === "Reset session expired."
      ) {
        reply.header(
          "Set-Cookie",
          clearCookie(
            app.container.infra.passwordResetSessionManager.cookieName,
            isSecureResetCookie,
            resetCookiePath
          )
        );
      }

      if (message === "Invalid token.") {
        return reply.code(400).send({ error: "INVALID_TOKEN" });
      }

      if (message === "Token already used.") {
        return reply.code(400).send({ error: "TOKEN_ALREADY_USED" });
      }

      if (message === "Token expired.") {
        return reply.code(400).send({ error: "TOKEN_EXPIRED" });
      }

      if (message === "Invalid reset session.") {
        return reply.code(401).send({ error: "RESET_SESSION_INVALID" });
      }

      if (message === "Reset session expired.") {
        return reply.code(401).send({ error: "RESET_SESSION_EXPIRED" });
      }

      if (message === "User not found.") {
        return reply.code(404).send({ error: "USER_NOT_FOUND" });
      }

      return reply.code(400).send({
        error: "BAD_REQUEST",
        message,
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
