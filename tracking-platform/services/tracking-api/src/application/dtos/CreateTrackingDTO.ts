export type CreateTrackingInput = {
    carrierSlug: string;
    trackingCode: string;
}

export type CreateTrackingOutput = {
    id: string;
    carrierId: string;
    trackingCode: string;
    currentStatus: string;
    isActive: boolean;
    createdAt: string;
}