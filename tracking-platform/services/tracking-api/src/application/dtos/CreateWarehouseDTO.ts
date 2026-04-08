export type CreateWarehouseInput = {
    name: string;
    code: string;
    address: string;
}

export type CreateWarehouseOutput = {
    id: string;
    name: string;
    code: string;
    address: string;
    createdAt: string;
    updatedAt: string;
}
