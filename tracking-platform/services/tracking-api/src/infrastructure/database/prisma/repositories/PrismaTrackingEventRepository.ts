import { TrackingEventRepository } from "../../../../domain/repositories/trackRepository/TrackingEventRepository";
import { TrackingEvent } from "@domain/entites/TrackingEvent";
import { prisma } from "../client";
import { TrackingEventMapper } from "../mappers/TrackingEventMapper";

export class PrismaTrackingEventRepository implements TrackingEventRepository {
  async listByTrackingId(trackingId: string): Promise<TrackingEvent[]> {
    const rows = await prisma.trackingEvent.findMany({
      where: { trackingId },
      orderBy: { eventAt: "asc" },
    });

    return rows.map((r) => TrackingEventMapper.toDomain(r as any));
  }

  async createManyIfNotExists(events: TrackingEvent[]): Promise<{ inserted: number }> {
    if (events.length === 0) return { inserted: 0 };

    const result = await prisma.trackingEvent.createMany({
      data: events.map((e) => ({
        trackingId: e.props.trackingId,
        eventAt: e.props.eventAt,
        status: e.props.status as any,
        description: e.props.description,
        location: e.props.location ?? null,
        rawPayload: (e.props.rawPayload ?? null) as any,
        eventHash: e.props.eventHash.raw,
      })),
      skipDuplicates: true,
    });

    return { inserted: result.count };
  }
}
