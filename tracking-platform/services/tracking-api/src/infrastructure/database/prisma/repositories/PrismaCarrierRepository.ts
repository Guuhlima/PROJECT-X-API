import { CarrierRepository } from "../../../../domain/repositories/trackRepository/CarrierRepository";
import { Carrier } from "@domain/entites/Carrier"; 
import { CarrierSlug } from "../../../../domain/value-objects/tracking-objects/CarrierSlug";
import { prisma } from "../client";
import { CarrierMapper } from "../mappers/CarrierMapper";

export class PrismaCarrierRepository implements CarrierRepository {
  async findById(id: string): Promise<Carrier | null> {
    const row = await prisma.carrier.findUnique({ where: { id } });
    return row ? CarrierMapper.toDomain(row as any) : null;
  }

  async findBySlug(slug: CarrierSlug): Promise<Carrier | null> {
    const row = await prisma.carrier.findFirst({ where: { slug: slug.raw } });
    return row ? CarrierMapper.toDomain(row as any) : null;
  }

  async listActive(): Promise<Carrier[]> {
    const rows = await prisma.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return rows.map((r) => CarrierMapper.toDomain(r as any));
  }
}
