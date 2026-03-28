export interface Notifier {
    userCreated(input: { id: string; name: string; email: string }): Promise<void>;

    passwordResetRequested(input: {
        userId: string;
        name: string;
        email: string;
        resetUrl: string;
        expiresAt: string;
    }): Promise<void>;
}