import { AppError } from "@shared/errors/AppError";

export class DomainError extends AppError {
    constructor(message: string) {
        super({
            module: "shared",
            code: "BAD_REQUEST",
            message,
            statusCode: 400,
            response: {
                error: "BAD_REQUEST",
                message,
            },
        });

        this.name = "DomainError";
    }
}
