type AppErrorInput = {
    module: string;
    code: string;
    message: string;
    statusCode: number;
    response?: Record<string, unknown>;
}

export class AppError extends Error {
    readonly module: string;
    readonly code: string;
    readonly statusCode: number;
    readonly response?: Record<string, unknown>;

    constructor(input: AppErrorInput) {
        super(input.message);
        this.name = "AppError";
        this.module = input.module;
        this.code = input.code;
        this.statusCode = input.statusCode;
        this.response = input.response;
    }
}

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

export function getAppErrorCode(error: unknown): string | null {
    return isAppError(error) ? error.code : null;
}
