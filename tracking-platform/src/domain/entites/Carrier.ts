import { CarrierSlug } from "@domain/value-objects/tracking-objects/CarrierSlug";

export type CarrierProps = {
    id: string;
    slug: CarrierSlug;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Carrier {
    constructor(public readonly props: CarrierProps) {}

    get id() { return this.props.id ;}
    get slug() { return this.props.slug.raw; }
}