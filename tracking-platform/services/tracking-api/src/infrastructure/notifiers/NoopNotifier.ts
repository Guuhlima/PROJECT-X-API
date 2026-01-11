import { Notifier } from "@application/ports/Notifier";

export class NoopNotifier implements Notifier {
    async userCreated(): Promise<void> {}
}