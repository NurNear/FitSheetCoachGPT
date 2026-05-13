export function toIsoString(value?: string): string {
  if (!value) return new Date().toISOString();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date");
  }

  return parsed.toISOString();
}

export function isoDate(value = new Date()): string {
  return value.toISOString().slice(0, 10);
}
