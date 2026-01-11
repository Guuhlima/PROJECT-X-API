import { Tracking } from "@domain/entites/Tracking";
import { TrackingCode } from "@domain/value-objects/tracking-objects/TrackingCode";
import { TrackingStatus } from "@domain/value-objects/tracking-objects/TrackingStatus";

export class TrackingMapper {
  static toDomain(row: {
    id: string;
    carrierId: string;
    trackingCode: string;
    currentStatus: TrackingStatus;
    lastEventAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Tracking {
    return new Tracking({
      id: row.id,
      carrierId: row.carrierId,
      trackingCode: TrackingCode.create(row.trackingCode),
      currentStatus: row.currentStatus,
      lastEventAt: row.lastEventAt,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}