import { PrismaClient } from "generated/prisma/client";
import { 
    PasswordResetTokenRecord,
    PasswordResetTokenRepository,
} from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository";

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(input: {
        id: string
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void> {
        await this.prisma.passwordResetToken.create({
            data: input,
        });
    }

    async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
        const row = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash }
        });

        if (!row) return null;

        return {
            id: row.id,
            userId: row.userId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
            createdAt: row.createdAt,
        };
    }

    async deleteByUserId(userId: string): Promise<void> {
        await this.prisma.passwordResetToken.deleteMany({
            where: { userId, usedAt: null },
        })
    }

    async markAsUsed(id: string): Promise<void> {
        await this.prisma.passwordResetToken.update({
            where: { id },
            data: { usedAt: new Date() },
        })
    }
}