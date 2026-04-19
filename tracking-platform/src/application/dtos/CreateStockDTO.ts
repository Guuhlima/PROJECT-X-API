export type CreateStockInput = {
    warehouseId: string;
    sku: string;
    productName: string;
    quantity: number;
}

export type CreateStockOutput = {
    id: string;
    warehouseId: string;
    sku: string;
    productName: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}
