import { PrismaClient } from "generated/prisma/client";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { User } from "@domain/entites/User";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { Email } from "@domain/value-objects/User-objects/Email";
import { UserName } from "@domain/value-objects/User-objects/UserName";
import { PasswordHash } from "@domain/value-objects/User-objects/PasswordHash";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.users.findUnique({
      where: { id: id.raw },
    });

    if (!row) return null;

    return User.restore({
      id: UserId.create(row.id),
      name: UserName.create(row.name),
      email: Email.create(row.email),
      passwordHash: PasswordHash.create(row.password),
      active: row.active,
      verified: row.verified,
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.users.findUnique({
      where: { email: email.raw },
    });

    if (!row) return null;

    return User.restore({
      id: UserId.create(row.id),
      name: UserName.create(row.name),
      email: Email.create(row.email),
      passwordHash: PasswordHash.create(row.password),
      active: row.active,
      verified: row.verified,
    });
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.users.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.passwordHash,
        active: user.isActive,
        verified: user.isVerified,
      },
    });

    return User.restore({
      id: UserId.create(row.id),
      name: UserName.create(row.name),
      email: Email.create(row.email),
      passwordHash: PasswordHash.create(row.password),
      active: row.active,
      verified: row.verified,
    });
  }

  async save(user: User): Promise<void> {
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.passwordHash,
        active: user.isActive,
        verified: user.isVerified,
      },
    });
  }
}
