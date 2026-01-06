import { DomainError } from "@domain/errors/DomainError";

export class EventHash {
    private constructor(private readonly value: string) {}

    static create(input: string): EventHash {
        const value = (input ?? "").trim();

        if (!value) throw new DomainError("EventHash is required.");

        if (value.length < 8) throw new DomainError("EventHash is too short");

        return new EventHash(value);
    }

    get raw(): string {
        return this.value;
    }
}