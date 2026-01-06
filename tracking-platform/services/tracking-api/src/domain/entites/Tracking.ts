import { TrackingStatus } from "@domain/value-objects/TrackingStatus";
import { TrackingCode } from "@domain/value-objects/TrackingCode";

export type TrackingProps = {
    id: string;
    carrierId: string;
    trackingCode: TrackingCode;
    currentStatus: TrackingStatus;
    lastEventAt?: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export class Tracking {
    constructor(public readonly props: TrackingProps) {}

    get id() { return this.props.id; }
    get code() { return this.props.trackingCode.raw; }

    setStatus(status: TrackingStatus, lastEventAt?: Date | null) {
        this.props.currentStatus = status;
        if (lastEventAt) this.props.lastEventAt = lastEventAt;
    }

    deactivate() {
        this.props.isActive = false;
    }

    activate() {
        this.props.isActive = true;
    }
}