import { CreateStockInput, CreateStockOutput } from "@application/dtos/CreateStockDTO";
import { StockRepository } from "@domain/repositories/stockRepository/StockRepository";
import { WarehouseRepository } from "@domain/repositories/wareHouseRepository/WarehouseRepository";
import { inventoryErrors } from "@shared/errors/inventory/InventoryErrors";

export class CreateStockUseCase {
    constructor(
        private readonly warehouseRepository: WarehouseRepository,
        private readonly stockRepository: StockRepository,
    ) {}

    async execute(input: CreateStockInput): Promise<CreateStockOutput> {
        const warehouseId = input.warehouseId?.trim();
        const sku = input.sku?.trim().toUpperCase();
        const productName = input.productName?.trim();

        if (!warehouseId) {
            throw inventoryErrors.warehouseIdRequired();
        }

        if (!sku) {
            throw inventoryErrors.skuRequired();
        }

        if (!productName) {
            throw inventoryErrors.productNameRequired();
        }

        if (!Number.isInteger(input.quantity) || input.quantity < 0) {
            throw inventoryErrors.invalidQuantity();
        }

        const warehouse = await this.warehouseRepository.findById(warehouseId);
        if (!warehouse) {
            throw inventoryErrors.warehouseNotFound();
        }

        const existing = await this.stockRepository.findByWarehouseAndSku(warehouseId, sku);
        if (existing) {
            throw inventoryErrors.stockAlreadyExists();
        }

        const stock = await this.stockRepository.create({
            warehouseId,
            sku,
            productName,
            quantity: input.quantity,
        });

        return {
            id: stock.props.id,
            warehouseId: stock.props.warehouseId,
            sku: stock.props.sku,
            productName: stock.props.productName,
            quantity: stock.props.quantity,
            createdAt: stock.props.createdAt.toISOString(),
            updatedAt: stock.props.updatedAt.toISOString(),
        };
    }
}
