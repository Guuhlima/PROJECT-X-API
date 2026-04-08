import { Stock } from "@domain/entites/Stock";  

export interface StockRepository {
    findById(id: string): Promise<Stock | null>;
    findByWarehouseAndSku(warehouseId: string, sku: string): Promise<Stock | null>;
    create(input: {
        warehouseId: string;
        sku: string;
        productName: string;
        quantity: number;
    }): Promise<Stock>;
    save(stock: Stock): Promise<void>;
}
