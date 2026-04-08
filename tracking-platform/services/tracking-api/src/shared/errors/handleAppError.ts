import { FastifyReply } from "fastify";
import { isAppError } from "@shared/errors/AppError";

export function sendAppError(reply: FastifyReply, error: unknown) {
    if (isAppError(error)) {
        return reply
            .code(error.statusCode)
            .send(error.response ?? { error: error.code, message: error.message });
    }

    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    return reply.code(500).send({
        error: "INTERNAL_SERVER_ERROR",
        message,
    });
}
