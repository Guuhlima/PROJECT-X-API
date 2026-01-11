export interface Notifier {
    userCreated(input: { id: string; name: string; email: string }): Promise<void>;
}