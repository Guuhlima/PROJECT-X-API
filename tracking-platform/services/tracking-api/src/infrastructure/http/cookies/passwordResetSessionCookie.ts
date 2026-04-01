type SerializeCookieInput = {
  name: string;
  value: string;
  maxAgeSeconds: number;
  secure: boolean;
  path?: string;
};

const DEFAULT_PATH = "/api";

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};

  return header.split(";").reduce<Record<string, string>>((acc, chunk) => {
    const [rawName, ...rawValue] = chunk.trim().split("=");
    if (!rawName) return acc;

    acc[rawName] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
}

export function serializeCookie(input: SerializeCookieInput): string {
  const parts = [
    `${input.name}=${encodeURIComponent(input.value)}`,
    `Max-Age=${input.maxAgeSeconds}`,
    `Path=${input.path ?? DEFAULT_PATH}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (input.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearCookie(name: string, secure: boolean, path = DEFAULT_PATH): string {
  const parts = [
    `${name}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `Path=${path}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}
