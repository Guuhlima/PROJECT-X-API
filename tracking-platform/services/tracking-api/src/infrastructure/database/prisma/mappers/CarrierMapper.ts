import { Carrier } from "@domain/entites/Carrier";
import { CarrierSlug } from "@domain/value-objects/CarrierSlug";

export class CarrierMapper {
    static toDomain(row: {
        id: string;
        slug: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): Carrier {
        return new Carrier({
            id: row.id,
            slug: CarrierSlug.create(row.slug),
            name: row.name,
            isActive: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }
}