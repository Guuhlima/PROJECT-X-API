import { Tracking } from "@domain/entites/Tracking";
import { TrackingCode } from "@domain/value-objects/TrackingCode";

export interface TrackingRepository {
    findById(id: string): Promise<Tracking | null>;
    findByCarrierAndCode(carrierId: string, trackingCode: TrackingCode): Promise<Tracking | null>;
    create(input: {
        carrierId: string;
        trackingCode: TrackingCode;
        isActive: boolean;
    }): Promise<Tracking>;
    save(tracking: Tracking): Promise<void>;
}