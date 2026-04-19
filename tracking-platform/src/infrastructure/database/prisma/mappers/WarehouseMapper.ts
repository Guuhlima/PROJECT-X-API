import { Warehouse } from "@domain/entites/Warehouse";

export class WarehouseMapper {
    static toDomain(row: {
        id: string;
        name: string;
        code: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }): Warehouse {
        return new Warehouse({
            id: row.id,
            name: row.name,
            code: row.code,
            address: row.address,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}
