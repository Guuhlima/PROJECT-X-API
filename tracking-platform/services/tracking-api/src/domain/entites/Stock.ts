export type StockProps = {
    id: string;
    warehouseId: string;
    sku: string;
    productName: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export class Stock {
    constructor(public readonly props: StockProps) {}

    get id() { return this.props.id; }
    get sku() { return this.props.sku; }

    increase(quantity: number) {
        this.props.quantity += quantity
    }

    decrease(quantity: number) {
        if (this.props.quantity - quantity < 0) {
            throw new Error("Invalid Quantity");
        }

        this.props.quantity -= quantity
    }
}