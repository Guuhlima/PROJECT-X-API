import { WarehouseRepository } from "@domain/repositories/wareHouseRepository/WarehouseRepository";
import { Warehouse } from "@domain/entites/Warehouse";
import { prisma } from "@infrastructure/database/prisma/client";
import { WarehouseMapper } from "@infrastructure/database/prisma/mappers/WarehouseMapper";

export class PrismaWarehouseRepository implements WarehouseRepository {
    async findById(id: string): Promise<Warehouse | null> {
        const row = await prisma.wareHouse.findUnique({ where: { id } });
        return row ? WarehouseMapper.toDomain(row) : null;
    }

    async findByCode(code: string): Promise<Warehouse | null> {
        const row = await prisma.wareHouse.findFirst({ where: { code } });
        return row ? WarehouseMapper.toDomain(row) : null;
    }

    async create(input: {
        name: string;
        code: string;
        address: string;
    }): Promise<Warehouse> {
        const row = await prisma.wareHouse.create({
            data: {
                name: input.name,
                code: input.code,
                address: input.address,
            },
        });

        return WarehouseMapper.toDomain(row);
    }

    async save(warehouse: Warehouse): Promise<void> {
        await prisma.wareHouse.update({
            where: { id: warehouse.props.id },
            data: {
                name: warehouse.props.name,
                code: warehouse.props.code,
                address: warehouse.props.address,
            },
        });
    }
}
