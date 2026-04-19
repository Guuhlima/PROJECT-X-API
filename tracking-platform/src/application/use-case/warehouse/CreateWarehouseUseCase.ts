import { CreateWarehouseInput, CreateWarehouseOutput } from "@application/dtos/CreateWarehouseDTO";
import { WarehouseRepository } from "@domain/repositories/wareHouseRepository/WarehouseRepository";
import { inventoryErrors } from "@shared/errors/inventory/InventoryErrors";

export class CreateWarehouseUseCase {
    constructor(private readonly warehouseRepository: WarehouseRepository) {}

    async execute(input: CreateWarehouseInput): Promise<CreateWarehouseOutput> {
        const name = input.name?.trim();
        const code = input.code?.trim().toUpperCase();
        const address = input.address?.trim();

        if (!name) {
            throw inventoryErrors.warehouseNameRequired();
        }

        if (!code) {
            throw inventoryErrors.warehouseCodeRequired();
        }

        if (!address) {
            throw inventoryErrors.warehouseAddressRequired();
        }

        const existing = await this.warehouseRepository.findByCode(code);
        if (existing) {
            throw inventoryErrors.warehouseCodeInUse();
        }

        const warehouse = await this.warehouseRepository.create({
            name,
            code,
            address,
        });

        return {
            id: warehouse.props.id,
            name: warehouse.props.name,
            code: warehouse.props.code,
            address: warehouse.props.address,
            createdAt: warehouse.props.createdAt.toISOString(),
            updatedAt: warehouse.props.updatedAt.toISOString(),
        };
    }
}
