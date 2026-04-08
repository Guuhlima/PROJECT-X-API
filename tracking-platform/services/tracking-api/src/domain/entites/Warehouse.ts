export type WarehouseProps = {
    id: string;
    name: string;
    code: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Warehouse {
    constructor(public readonly props: WarehouseProps) {}

    get id() { return this.props.id; }
    get code() { return this.props.code; }

    rename(name: string) {
        this.props.name = name;
    }

    changeAddress(address: string) {
        this.props.address = address;
    }
}
