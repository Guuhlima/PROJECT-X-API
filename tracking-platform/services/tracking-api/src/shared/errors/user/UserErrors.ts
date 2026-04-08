import { AppError, getAppErrorCode } from "@shared/errors/AppError";

const moduleName = "user";

export const userErrors = {
    emailInUse: () =>
        new AppError({
            module: moduleName,
            code: "EMAIL_IN_USE",
            message: "Email is already in use.",
            statusCode: 409,
            response: { error: "EMAIL_IN_USE" },
        }),
    invalidCredentials: () =>
        new AppError({
            module: moduleName,
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials.",
            statusCode: 401,
            response: { error: "INVALID_CREDENTIALS" },
        }),
    userInactive: () =>
        new AppError({
            module: moduleName,
            code: "USER_INACTIVE",
            message: "User is inactive.",
            statusCode: 403,
            response: { error: "USER_INACTIVE" },
        }),
    userNotVerified: () =>
        new AppError({
            module: moduleName,
            code: "USER_NOT_VERIFIED",
            message: "User is not verified.",
            statusCode: 403,
            response: { error: "USER_NOT_VERIFIED" },
        }),
    authConfigError: () =>
        new AppError({
            module: moduleName,
            code: "AUTH_CONFIG_ERROR",
            message: "Missing auth JWT secret.",
            statusCode: 500,
            response: {
                error: "AUTH_CONFIG_ERROR",
                message: "Authentication is not configured on the server.",
            },
        }),
    invalidToken: () =>
        new AppError({
            module: moduleName,
            code: "INVALID_TOKEN",
            message: "Invalid token.",
            statusCode: 400,
            response: { error: "INVALID_TOKEN" },
        }),
    tokenAlreadyUsed: () =>
        new AppError({
            module: moduleName,
            code: "TOKEN_ALREADY_USED",
            message: "Token already used.",
            statusCode: 400,
            response: { error: "TOKEN_ALREADY_USED" },
        }),
    tokenExpired: () =>
        new AppError({
            module: moduleName,
            code: "TOKEN_EXPIRED",
            message: "Token expired.",
            statusCode: 400,
            response: { error: "TOKEN_EXPIRED" },
        }),
    userNotFound: () =>
        new AppError({
            module: moduleName,
            code: "USER_NOT_FOUND",
            message: "User not found.",
            statusCode: 404,
            response: { error: "USER_NOT_FOUND" },
        }),
    invalidResetSession: () =>
        new AppError({
            module: moduleName,
            code: "RESET_SESSION_INVALID",
            message: "Invalid reset session.",
            statusCode: 401,
            response: { error: "RESET_SESSION_INVALID" },
        }),
    resetSessionExpired: () =>
        new AppError({
            module: moduleName,
            code: "RESET_SESSION_EXPIRED",
            message: "Reset session expired.",
            statusCode: 401,
            response: { error: "RESET_SESSION_EXPIRED" },
        }),
    passwordResetSessionConfigError: () =>
        new AppError({
            module: moduleName,
            code: "PASSWORD_RESET_SESSION_CONFIG_ERROR",
            message: "Missing password reset session secret.",
            statusCode: 500,
            response: {
                error: "PASSWORD_RESET_SESSION_CONFIG_ERROR",
                message: "Password reset session is not configured on the server.",
            },
        }),
};

export function shouldClearResetSessionCookie(error: unknown): boolean {
    const code = getAppErrorCode(error);

    return (
        code === "RESET_SESSION_INVALID" ||
        code === "RESET_SESSION_EXPIRED"
    );
}
