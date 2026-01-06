import { TrackingStatus } from "@domain/value-objects/TrackingStatus";  
import { EventHash } from "@domain/value-objects/EventHash";

export type TrackingEventProps = {
  id: string;
  trackingId: string;
  eventAt: Date;
  status: TrackingStatus;
  description: string;
  location?: string | null;
  rawPayload?: unknown | null;
  eventHash: EventHash;
  createdAt: Date;
};

export class TrackingEvent {
    constructor(public readonly props: TrackingEventProps) {}

    get id() { return this.props.id; }
    get hash() { return this.props.eventHash.raw; }
}