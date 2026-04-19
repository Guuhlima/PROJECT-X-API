import { Carrier } from "@domain/entites/Carrier";
import { CarrierSlug } from "@domain/value-objects/tracking-objects/CarrierSlug";

export interface CarrierRepository {
    findById(id: string): Promise<Carrier | null>
    findBySlug(slug: CarrierSlug): Promise<Carrier | null>
    listActive(): Promise<Carrier[]>
}