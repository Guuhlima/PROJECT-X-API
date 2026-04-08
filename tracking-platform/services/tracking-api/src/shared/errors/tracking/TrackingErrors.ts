import { AppError } from "@shared/errors/AppError";

const moduleName = "tracking";

export const trackingErrors = {
    carrierNotFound: () =>
        new AppError({
            module: moduleName,
            code: "CARRIER_NOT_FOUND",
            message: "Carrier not found.",
            statusCode: 404,
            response: { error: "CARRIER_NOT_FOUND" },
        }),
};
