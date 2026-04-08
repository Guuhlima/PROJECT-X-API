import { StockRepository } from "@domain/repositories/stockRepository/StockRepository";
import { Stock } from "@domain/entites/Stock";
import { prisma } from "@infrastructure/database/prisma/client";
import { StockMapper } from "@infrastructure/database/prisma/mappers/StockMapper";

export class PrismaStockRepository implements StockRepository {
    async findById(id: string): Promise<Stock | null> {
        const row = await prisma.stock.findUnique({ where: { id } });
        return row ? StockMapper.toDomain(row) : null;
    }

    async findByWarehouseAndSku(warehouseId: string, sku: string): Promise<Stock | null> {
        const row = await prisma.stock.findUnique({
            where: {
                warehouseId_sku: {
                    warehouseId,
                    sku,
                },
            },
        });

        return row ? StockMapper.toDomain(row) : null;
    }

    async create(input: {
        warehouseId: string;
        sku: string;
        productName: string;
        quantity: number;
    }): Promise<Stock> {
        const row = await prisma.stock.create({
            data: {
                warehouseId: input.warehouseId,
                sku: input.sku,
                productName: input.productName,
                quantity: input.quantity,
            },
        });

        return StockMapper.toDomain(row);
    }

    async save(stock: Stock): Promise<void> {
        await prisma.stock.update({
            where: { id: stock.props.id },
            data: {
                sku: stock.props.sku,
                productName: stock.props.productName,
                quantity: stock.props.quantity,
            },
        });
    }
}
