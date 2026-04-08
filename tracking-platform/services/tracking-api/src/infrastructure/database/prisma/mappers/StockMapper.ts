import { Stock } from "@domain/entites/Stock";

export class StockMapper {
    static toDomain(row: {
        id: string;
        warehouseId: string;
        sku: string;
        productName: string;
        quantity: number;
        createdAt: Date;
        updatedAt: Date;
    }): Stock {
        return new Stock({
            id: row.id,
            warehouseId: row.warehouseId,
            sku: row.sku,
            productName: row.productName,
            quantity: row.quantity,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
