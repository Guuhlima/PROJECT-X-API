import { Warehouse } from "@domain/entites/Warehouse";

export interface WarehouseRepository {
    findById(id: string): Promise<Warehouse | null>;
    findByCode(code: string): Promise<Warehouse | null>;
    create(input: {
        name: string;
        code: string;
        address: string;
    }): Promise<Warehouse>
    save(warehouse: Warehouse): Promise<void>;
}