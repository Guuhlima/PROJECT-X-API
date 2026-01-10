import { DomainError } from "@shared/errors/DomainError";

export class CarrierSlug {
    private constructor(private readonly value: string) {}

    static create(input: string): CarrierSlug {
        const value = (input ?? "").trim().toLowerCase();

        if (!value) throw new DomainError("CarrierSlug is required.");

        if (!/^[a-z0-9-]+$/.test(value)) {
            throw new DomainError("CarrierSlug must contain only letters, numbers and hyphens.");
        }

        return new CarrierSlug(value);
    }

    get raw(): string {
        return this.value;
    }
}