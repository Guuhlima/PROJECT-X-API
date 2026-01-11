import { DomainError } from "@shared/errors/DomainError";

export class TrackingCode {
    private constructor(private readonly value: string) {}

    static create(input: string): TrackingCode {
        const value = (input ?? "").trim();
        if (!value) throw new DomainError("TrackingCode is required.");
        if (value.length < 5) throw new DomainError("TrackingCode is too short.");
        return new TrackingCode(value);
    }

    get raw(): string {
        return this.value;
    }
}