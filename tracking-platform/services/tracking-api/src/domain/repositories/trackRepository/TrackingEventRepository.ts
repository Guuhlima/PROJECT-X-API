import { TrackingEvent } from "@domain/entites/TrackingEvent";

export interface TrackingEventRepository {
  listByTrackingId(trackingId: string): Promise<TrackingEvent[]>;
  createManyIfNotExists(events: TrackingEvent[]): Promise<{ inserted: number }>;
}
