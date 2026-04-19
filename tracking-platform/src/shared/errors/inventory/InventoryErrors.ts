import { AppError } from "@shared/errors/AppError";

const moduleName = "inventory";

export const inventoryErrors = {
    warehouseNameRequired: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_NAME_REQUIRED",
            message: "Warehouse name is required.",
            statusCode: 400,
            response: { error: "WAREHOUSE_NAME_REQUIRED" },
        }),
    warehouseCodeRequired: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_CODE_REQUIRED",
            message: "Warehouse code is required.",
            statusCode: 400,
            response: { error: "WAREHOUSE_CODE_REQUIRED" },
        }),
    warehouseAddressRequired: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_ADDRESS_REQUIRED",
            message: "Warehouse address is required.",
            statusCode: 400,
            response: { error: "WAREHOUSE_ADDRESS_REQUIRED" },
        }),
    warehouseCodeInUse: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_CODE_IN_USE",
            message: "Warehouse code is already in use.",
            statusCode: 409,
            response: { error: "WAREHOUSE_CODE_IN_USE" },
        }),
    warehouseIdRequired: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_ID_REQUIRED",
            message: "Warehouse id is required.",
            statusCode: 400,
            response: { error: "WAREHOUSE_ID_REQUIRED" },
        }),
    skuRequired: () =>
        new AppError({
            module: moduleName,
            code: "SKU_REQUIRED",
            message: "SKU is required.",
            statusCode: 400,
            response: { error: "SKU_REQUIRED" },
        }),
    productNameRequired: () =>
        new AppError({
            module: moduleName,
            code: "PRODUCT_NAME_REQUIRED",
            message: "Product name is required.",
            statusCode: 400,
            response: { error: "PRODUCT_NAME_REQUIRED" },
        }),
    invalidQuantity: () =>
        new AppError({
            module: moduleName,
            code: "INVALID_QUANTITY",
            message: "Quantity must be a non-negative integer.",
            statusCode: 400,
            response: { error: "INVALID_QUANTITY" },
        }),
    warehouseNotFound: () =>
        new AppError({
            module: moduleName,
            code: "WAREHOUSE_NOT_FOUND",
            message: "Warehouse not found.",
            statusCode: 404,
            response: { error: "WAREHOUSE_NOT_FOUND" },
        }),
    stockAlreadyExists: () =>
        new AppError({
            module: moduleName,
            code: "STOCK_ALREADY_EXISTS",
            message: "Stock already exists for this warehouse and SKU.",
            statusCode: 409,
            response: { error: "STOCK_ALREADY_EXISTS" },
        }),
    stockCannotBeNegative: () =>
        new AppError({
            module: moduleName,
            code: "STOCK_CANNOT_BE_NEGATIVE",
            message: "Stock quantity cannot be negative.",
            statusCode: 400,
            response: { error: "STOCK_CANNOT_BE_NEGATIVE" },
        }),
};
