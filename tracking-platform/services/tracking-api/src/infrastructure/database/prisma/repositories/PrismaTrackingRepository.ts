import { TrackingRepository } from "../../../../domain/repositories/trackRepository/TrackingRepository";
import { Tracking } from "@domain/entites/Tracking";
import { TrackingCode } from "../../../../domain/value-objects/tracking-objects/TrackingCode";
import { prisma } from "../client";
import { TrackingMapper } from "../mappers/TrackingMapper";

export class PrismaTrackingRepository implements TrackingRepository {
  async findById(id: string): Promise<Tracking | null> {
    const row = await prisma.tracking.findUnique({ where: { id } });
    return row ? TrackingMapper.toDomain(row as any) : null;
  }

  async findByCarrierAndCode(carrierId: string, trackingCode: TrackingCode): Promise<Tracking | null> {
    const row = await prisma.tracking.findUnique({
      where: { carrierId_trackingCode: { carrierId, trackingCode: trackingCode.raw } },
    });

    return row ? TrackingMapper.toDomain(row as any) : null;
  }

  async create(input: {
    carrierId: string;
    trackingCode: TrackingCode;
    isActive: boolean;
  }): Promise<Tracking> {
    const row = await prisma.tracking.create({
      data: {
        carrierId: input.carrierId,
        trackingCode: input.trackingCode.raw,
        isActive: input.isActive,
      },
    });

    return TrackingMapper.toDomain(row as any);
  }

  async save(tracking: Tracking): Promise<void> {
    await prisma.tracking.update({
      where: { id: tracking.props.id },
      data: {
        currentStatus: tracking.props.currentStatus as any,
        lastEventAt: tracking.props.lastEventAt ?? null,
        isActive: tracking.props.isActive,
      },
    });
  }
}
