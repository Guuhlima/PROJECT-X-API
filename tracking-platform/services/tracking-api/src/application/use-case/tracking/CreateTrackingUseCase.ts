import { CarrierRepository } from "../../domain/repositories/trackRepository/CarrierRepository";
import { TrackingRepository } from "../../domain/repositories/trackRepository/TrackingRepository";
import { CarrierSlug } from "../../domain/value-objects/tracking-objects/CarrierSlug";
import { TrackingCode } from "../../domain/value-objects/tracking-objects/TrackingCode";
import { CreateTrackingInput, CreateTrackingOutput } from "../dtos/CreateTrackingDTO";

export class CreateTrackingUseCase {
  constructor(
    private readonly carrierRepo: CarrierRepository,
    private readonly trackingRepo: TrackingRepository,
  ) {}

  async execute(input: CreateTrackingInput): Promise<CreateTrackingOutput> {
    const slug = CarrierSlug.create(input.carrierSlug);
    const code = TrackingCode.create(input.trackingCode);

    const carrier = await this.carrierRepo.findBySlug(slug);
    if (!carrier) {
      throw new Error("CARRIER_NOT_FOUND");
    }

    const existing = await this.trackingRepo.findByCarrierAndCode(carrier.props.id, code);
    const tracking = existing ?? await this.trackingRepo.create({
      carrierId: carrier.props.id,
      trackingCode: code,
      isActive: true,
    });

    return {
      id: tracking.props.id,
      carrierId: tracking.props.carrierId,
      trackingCode: tracking.props.trackingCode.raw,
      currentStatus: tracking.props.currentStatus,
      isActive: tracking.props.isActive,
      createdAt: tracking.props.createdAt.toISOString(),
    };
  }
}
