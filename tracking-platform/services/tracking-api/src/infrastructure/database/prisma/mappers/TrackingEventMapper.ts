import { TrackingEvent } from "@domain/entites/TrackingEvent"; 
import { TrackingStatus } from "../../../../domain/value-objects/TrackingStatus";
import { EventHash } from "../../../../domain/value-objects/EventHash";

export class TrackingEventMapper {
  static toDomain(row: {
    id: string;
    trackingId: string;
    eventAt: Date;
    status: TrackingStatus;
    description: string;
    location: string | null;
    rawPayload: unknown | null;
    eventHash: string;
    createdAt: Date;
  }): TrackingEvent {
    return new TrackingEvent({
      id: row.id,
      trackingId: row.trackingId,
      eventAt: row.eventAt,
      status: row.status,
      description: row.description,
      location: row.location,
      rawPayload: row.rawPayload,
      eventHash: EventHash.create(row.eventHash),
      createdAt: row.createdAt,
    });
  }
}
