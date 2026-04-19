import crypto from "crypto"
import { UserRepository } from "@domain/repositories/userRepository/UserRepository"
import { PasswordResetTokenRepository } from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository"
import { Email } from "@domain/value-objects/User-objects/Email"
import { IdGenerator } from "@application/ports/IdGenerator"
import { Notifier } from "@application/ports/Notifier"
import { RequestPasswordResetOutput, RequestPasswordResetInput } from "@application/dtos/user/RequestPasswordResetDTO"   

export class RequestPasswordResetUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
        private readonly idGenerator: IdGenerator,
        private readonly notifier: Notifier,
        private readonly resetBaseUrl: string
    ) {}

    async execute(
        input: RequestPasswordResetInput
    ): Promise<RequestPasswordResetOutput> {
        const email = Email.create(input.email);
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            return {
                message: "If the e-mail exists, reset instructions will be sent",
            };
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

        await this.passwordResetTokenRepository.deleteByUserId(user.id);

        await this.passwordResetTokenRepository.create({
            id: this.idGenerator.newId(),
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        const resetUrl = `${this.resetBaseUrl}?token=${rawToken}`;

        try {
            await this.notifier.passwordResetRequested({
                userId: user.id,
                name: user.name,
                email: user.email,
                resetUrl,
                expiresAt: expiresAt.toISOString(),
            });
        } catch (err) {
            console.error("[RequestPasswordResetUseCase] notify error:", err);
        }

        return {
            message: "If the e-mail exists, reset instructions will be sent",
        }
    }
}