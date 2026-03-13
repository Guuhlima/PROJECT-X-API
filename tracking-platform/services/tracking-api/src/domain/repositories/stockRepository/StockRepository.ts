import { Stock } from "@domain/entites/Stock";  

export interface StockRepository {
    findById(id: String): Promise<Stock | null>;
    findByWarehouseAndSku(warehouseId: string, sku: string): Promise<Stock | null>;
    create(input: {
        warehouseId: string;
        sku: string;
        productName: string;
        qunatity: number;
    }): Promise<Stock>;
    save(stock: Stock): Promise<void>;
}