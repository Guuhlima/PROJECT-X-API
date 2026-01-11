import { DomainError } from "@shared/errors/DomainError";

export class UserId {
    private constructor(private readonly value: string) {}

    static create(input: string): UserId {
        const value = (input ?? "").trim();

        if (!value) throw new DomainError("UserId is required.");
        if (value.length < 8) throw new DomainError("UserId is too short.");

        return new UserId(value);
    }

    get raw(): string {
        return this.value;
    }
}