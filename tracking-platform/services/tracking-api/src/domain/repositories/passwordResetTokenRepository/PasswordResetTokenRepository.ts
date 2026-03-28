export type PasswordResetTokenRecord = {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}

export interface PasswordResetTokenRepository {
    create(input: {
        id: string;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;

    findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
    deleteByUserId(userId: string): Promise<void>;
    markAsUsed(id: string): Promise<void>;
}